//**********************************************
// This applies damage to the proper traits in
// the correct order. Basic approach is to apply
// damage to the first trait until it is 0. If
// more damage remains, apply it to the second
// and third traits in order. Second trait
// hitting 0 means unconsciousness, third trait
// hitting 0 means death.
//**********************************************

const target = scope.target; // foundry actor to apply the damage to
if (!target) {
    console.log('Whoops, you need to supply the target');
    return;
}
const totalDamage = scope.damage || 0; // damage to be applied
if (totalDamage <= 0) return; // no damage to apply, early exit
let piercingDamage = scope.piercingDamage || 0; // piercing damage to be applied (physical only)
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
const DISPLAY_NAMES = {
    "endurance": "endurance",
    "strength": "strength",
    "dexterity": "agility",
    "alternative3": "essence",
    "alternative2": "will",
    "socialStanding": "charisma",
};
const PHYSICAL_TRAITS = [KEYS.ENDURANCE, KEYS.STRENGTH, KEYS.AGILITY]; // in order
const SPIRIT_TRAITS = [KEYS.ESSENCE, KEYS.WILL, KEYS.CHARISMA]; // in order
const TRAITS = spiritDamage ? SPIRIT_TRAITS : PHYSICAL_TRAITS; // physical or spirit
const ARMOR = spiritDamage ? KEYS.SPIRIT_ARMOR : KEYS.PHYSICAL_ARMOR; // physical or spirit
const SPECIAL_EFFECTS_TABLES = ['Light', 'Medium', 'Heavy'];
const ADD = 2;

// kitchen sink object for returning damage process data
let results = {total_damage: totalDamage};
if (!spiritDamage) results.piercing_damage = piercingDamage;

let effectiveArmor = 0;
if (!ignoreArmor) {
    effectiveArmor = target.system[ARMOR].value; // includes toughness, if any
    if (piercingDamage > 0) {
        // get toughness effects for physical armor
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
        effectiveArmor -= piercingDamage;
        if (effectiveArmor < toughness) effectiveArmor = toughness; // piercing doesn't affect toughness
    }
}
results.effective_armor = effectiveArmor;
let remaining = totalDamage - effectiveArmor;
if (remaining < 0) remaining = 0;
results.damage_to_apply = remaining;
if (remaining <= 0) {
    return results; // no damage to apply, but data to report
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

let specialEffect = ''; // degree of special effect (light, medium, heavy)
let finalStatus = null; // unconscious or dead or not
// go through the three traits in order to apply damage
for (const [index, t] of TRAITS.entries()) {
    const trait = target.system.characteristics[t];
    // this trait is zeroed out - log and skip to next
    if (trait.current <= 0) {
        results[DISPLAY_NAMES[t]] = {current: 0, applied_damage: 0};
        continue;
    }

    // calculate the actual base trait value, not the stupidly dynamic one (back out effects)
    const changes = activeChanges.filter(ch => ch.key.includes(t));
    let baseValue = trait.value;
    // only support 'ADD' type changes
    if (changes.length && changes.every(ch => ch.mode === ADD)) {
        // reconstruct base value from modifiers
        changes.forEach(ch => baseValue -= ch.value);
    }

    // do the math to calculate what damage can be applied to this trait
    const currentDamage = trait.damage;
    const loss = Math.min(baseValue - currentDamage, remaining);
    const newDamage = currentDamage + loss;
    specialEffect = SPECIAL_EFFECTS_TABLES[index]; // tricksy way of tracking the degree of special effect
    remaining -= loss;
    results[DISPLAY_NAMES[t]] = {current: baseValue - currentDamage, applied_damage: loss};

    if (baseValue - newDamage <= 0) {
        const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
        const EFFECTS = await getGlobalEffectNames.execute();

        if ([KEYS.AGILITY, KEYS.CHARISMA].includes(t)) {
            finalStatus = EFFECTS.DEAD;
        } else if ([KEYS.STRENGTH, KEYS.WILL].includes(t)) {
            finalStatus = EFFECTS.UNCONSCIOUS;
        }
    }

    // apply new damage and update the visual presentation (token, character sheet, etc)
    await target.update({['system.characteristics.' + t + '.damage']: newDamage});

    // if no more damage to apply we're done
    if (remaining <= 0) break;
}

if (!spiritDamage) {
    results.final_status = finalStatus;
    results.special_effect_table = specialEffect;
}

return results;