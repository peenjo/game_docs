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
let remaining = scope.damage || 0; // damage to be applied
const piercingDamage = scope.piercingDamage || 0; // piercing damage to be applied (physical only)
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
const PHYSICAL_TRAITS = [KEYS.ENDURANCE, KEYS.STRENGTH, KEYS.AGILITY]; // in order
const SPIRIT_TRAITS = [KEYS.ESSENCE, KEYS.WILL, KEYS.CHARISMA]; // in order
const TRAITS = spiritDamage ? SPIRIT_TRAITS : PHYSICAL_TRAITS; // physical or spirit
const ARMOR = spiritDamage ? KEYS.SPIRIT_ARMOR : KEYS.PHYSICAL_ARMOR; // physical or spirit
const SPECIAL_EFFECTS_TABLES = ['Light', 'Medium', 'Heavy'];
const ADD = 2;

if (!ignoreArmor) {
    let effectiveArmor = target.system[ARMOR].value;
    if (!spiritDamage && piercingDamage) {
        effectiveArmor -= piercingDamage;
        if (effectiveArmor < 0) {
            effectiveArmor = 0;
        }
        // TODO ech 2026-10-01 - implement natural toughness
        // effectiveArmor += natural_toughness;
    }
    // console.log(`piercingDamage = ${piercingDamage}`);
    console.log(`effectiveArmor = ${effectiveArmor}`);
    remaining -= effectiveArmor;
}
console.log(`damage to apply = ${remaining}`);

if (remaining <= 0) return; // no damage to apply

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
    // console.log(`index ${index}, t ${t}`);
    const trait = target.system.characteristics[t];
    // console.log(`key ${trait}`);
    // this trait is zeroed out - skip to next
    if (trait.current <= 0) continue;

    const changes = activeChanges.filter(ch => ch.key.includes(t));
    // console.log(changes);
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
    // console.log(`loss = ${loss}`);
    // console.log(`newDamage = ${newDamage}`);
    // console.log(`remaining = ${remaining}`);

    if (baseValue - newDamage <= 0) {
        if ([KEYS.AGILITY, KEYS.CHARISMA].includes(t)) {
            finalStatus = "dead";
        } else if ([KEYS.STRENGTH, KEYS.WILL].includes(t)) {
            finalStatus = "unconscious";
        }
    }

    // apply new damage and update the visual presentation (token, character sheet, etc)
    await target.update({['system.characteristics.' + t + '.damage']: newDamage});

    // no more damage to apply - we're done
    if (remaining <= 0) break;
}

if (!spiritDamage) {
    const displayMessage = game.macros.getName("Display_Special_Effect_Message");

    if (finalStatus === "dead") {
        const chatContent = `<strong>${target.name}</strong> just DIED!`;
        await displayMessage.execute({message: chatContent});
    } else {
        if (finalStatus === "unconscious") {
            const chatContent = `<strong>${target.name}</strong> went unconscious!`;
            await displayMessage.execute({message: chatContent});
        }
        await displayMessage.execute({message: `Roll on the <strong>${specialEffect} Special Effects Table</strong>`});
    }
}
