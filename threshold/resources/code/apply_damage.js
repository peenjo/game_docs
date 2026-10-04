//*********************************************
// This applies damage to the proper traits in
// the correct order. Basic approach is to apply
// damage to the first trait until it is 0. If
// more damage remains, apply it to the second
// and third traits in order. Second trait
// hitting 0 means unconsciousness, third trait
// hitting 0 means death.
//*********************************************

const target = scope.target; // foundry actor to apply the damage to
if (!target) {
    console.log('Whoops, you need to supply the target');
    return;
}
const totalDamage = scope.damage || 0; // damage to be applied
if (totalDamage <= 0) return; // no damage to apply, early exit
let piercingDamage = scope.piercingDamage || 0; // piercing damage to be applied (physical only)
let nonPiercingDamage = totalDamage - piercingDamage;
const ignoreArmor = scope.ignoreArmor || false; // armor counts by default
const spiritDamage = scope.spiritDamage || false; // physical damage by default

const KEYS = {
    ENDURANCE: "endurance",
    STRENGTH: "strength",
    AGILITY: "dexterity",
    ESSENCE: "alternative3",
    WILL: "alternative2",
    CHARISMA: "socialStanding",
    PHYSICAL_ARMOR: "primaryArmor",
    SPIRIT_ARMOR: "radiationProtection", // ech 2026-09-27 - not ideal, but it's an unused value in twodsix code
};
// const DISPLAY_NAMES = {
//     ENDURANCE: "endurance",
//     STRENGTH: "strength",
//     AGILITY: "agility",
//     ESSENCE: "essence",
//     WILL: "will",
//     CHARISMA: "charisma",
// };
const PHYSICAL_TRAITS = [KEYS.ENDURANCE, KEYS.STRENGTH, KEYS.AGILITY]; // in order
const SPIRIT_TRAITS = [KEYS.ESSENCE, KEYS.WILL, KEYS.CHARISMA]; // in order
const TRAITS = spiritDamage ? SPIRIT_TRAITS : PHYSICAL_TRAITS; // physical or spirit
const ARMOR = spiritDamage ? KEYS.SPIRIT_ARMOR : KEYS.PHYSICAL_ARMOR; // physical or spirit
const SPECIAL_EFFECTS_TABLES = ['Light', 'Medium', 'Heavy'];
const ADD = 2;

// kitchen sink object for returning damage process data
let results = {
    total_damage: totalDamage,
    piercing_damage: piercingDamage,
    non_piercing_damage: nonPiercingDamage,
};

if (!ignoreArmor) {
    let effectiveArmor = target.system[ARMOR].value; // includes toughness, if any
    if (piercingDamage > 0) {
        // get toughness effects for physical armor
        // TODO ech 2026-10-02 - clean this up
        const armorChanges = target.appliedEffects
            .flatMap(eff =>
                eff.changes
                    .filter(ch => ch.key.includes(KEYS.PHYSICAL_ARMOR) &&
                        eff.name.toLowerCase().includes('toughness'))
                    .map(ch => ({
                        effect: eff.name,
                        key: ch.key,
                        mode: ch.mode,
                        value: ch.value
                    }))
            );
        let toughness = 0;
        for (const arm of armorChanges) {
            toughness += arm.value;
        }
        results.toughness = toughness;

        if (piercingDamage >= toughness) {
            piercingDamage -= toughness; // reduce piercing by toughness
            effectiveArmor -= toughness; // toughness used up, remove it from total armor
        } else {
            // all piercing caught by toughness
            effectiveArmor -= piercingDamage; // effective armor includes toughness, so reduce
            piercingDamage = 0;
        }
    }
    results.effective_armor = effectiveArmor;
    nonPiercingDamage -= effectiveArmor;
    if (nonPiercingDamage < 0) {
        nonPiercingDamage = 0; // armor soaked up all non-piercing damage
    }
}
let remaining = nonPiercingDamage + piercingDamage;
results.damage_to_apply = remaining;
if (remaining <= 0) {
    // console.log(JSON.stringify(results, null, 2));
    return results; // no damage to apply, but have data to report
}

// get relevant active effect changes to tease out base trait values
// which sadly are not stored: just the current derived values
const activeChanges = target.appliedEffects
    .flatMap(eff =>
        eff.changes
            .filter(ch => TRAITS.some(sub => ch.key.includes(sub)))
            .map(ch => ({
                effect: eff.name,
                key: ch.key,
                mode: ch.mode,
                value: ch.value
            }))
    );

let specialEffect = '';
let finalStatus = null;
for (const [index, t] of TRAITS.entries()) {
    const trait = target.system.characteristics[t];
    // this trait is zeroed out - log and skip to next
    if (trait.current <= 0) {
        // TODO ech 2026-10-03 - add damage 0 and current 0 to results
        // results
        continue;
    }

    const changes = activeChanges.filter(ch => ch.key.includes(t));
    let baseValue = trait.value;
    // only support 'ADD' type changes
    if (changes.length && changes.every(ch => ch.mode === ADD)) {
        // reconstruct base value from modifiers
        changes.forEach(ch => baseValue -= ch.value);
    }
    // console.log(`baseValue = ${baseValue}`);

    // do the math to calculate what damage can be applied to this trait
    const currentDamage = trait.damage;
    const loss = Math.min(baseValue - currentDamage, remaining);
    const newDamage = currentDamage + loss;
    specialEffect = SPECIAL_EFFECTS_TABLES[index]; // tricksy way of tracking the degree of special effect
    remaining -= loss;

    if (baseValue - newDamage <= 0) {
        if ([KEYS.AGILITY, KEYS.CHARISMA].includes(t)) {
            finalStatus = "dead"; // TODO ech 2026-10-03 - replace with global effect name
        } else if ([KEYS.STRENGTH, KEYS.WILL].includes(t)) {
            finalStatus = "unconscious"; // TODO ech 2026-10-03 - replace with global effect name
        }
    }

    // apply new damage and update the visual presentation (token, character sheet, etc)
    await target.update({['system.characteristics.' + t + '.damage']: newDamage});

    // no more damage to apply - we're done
    if (remaining <= 0) break;
}

if (!spiritDamage) {
    results.final_status = finalStatus;
    results.special_effect_table = specialEffect;
}

return results;