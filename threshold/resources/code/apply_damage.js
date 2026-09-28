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
const ignoreArmor = scope.ignoreArmor || false; // armor counts by default
const spiritDamage = scope.spiritDamage || false; // physical damage by default

const KEYS = {
    AGILITY: "dexterity",
    CHARISMA: "socialStanding",
    ENDURANCE: "endurance",
    ESSENCE: "alternative3",
    PHYSICAL_ARMOR: "primaryArmor",
    SPIRIT_ARMOR: "radiationProtection", // ech 2026-09-27 - not ideal, but it's an unused value in twodsix code
    STRENGTH: "strength",
    WILL: "alternative2",
};
const PHYSICAL_TRAITS = [KEYS.ENDURANCE, KEYS.STRENGTH, KEYS.AGILITY]; // in order
const SPIRIT_TRAITS = [KEYS.ESSENCE, KEYS.WILL, KEYS.CHARISMA]; // in order
const TRAITS = spiritDamage ? SPIRIT_TRAITS : PHYSICAL_TRAITS; // physical or spirit
const ARMOR = spiritDamage ? KEYS.SPIRIT_ARMOR : KEYS.PHYSICAL_ARMOR; // physical or spirit

let remaining = totalDamage;
// TODO ech 2026-09-27 - implement toughness
if (!ignoreArmor) {
    const armorValue = target.system[ARMOR].value;
    remaining -= armorValue;
}

const displayMessage = game.macros.getName("Display_Special_Effect_Message");

for (const trait of TRAITS) {
    // no more damage to apply - we're done
    if (remaining <= 0) return;

    const currentValue = target.system.characteristics[trait].current;
    // this trait is zeroed out - skip to next
    if (currentValue === 0) continue;

    // do the math to calculate what damage can be applied to this trait
    const currentDamage = target.system.characteristics[trait].damage;
    const loss = Math.min(currentValue, remaining);
    const newDamage = currentDamage + loss;
    remaining -= loss;

    // apply new damage and update the visual presentation (token, character sheet, etc)
    await target.update({['system.characteristics.' + trait + '.damage']: newDamage});

    if (currentValue - loss === 0) {
        if ([KEYS.AGILITY, KEYS.CHARISMA].includes(trait)) {
            // TODO ech 2026-09-09 - apply DEAD active effect?
            const chatContent = `<strong>${target.name}</strong> just DIED!`;
            await displayMessage.execute({message: chatContent});
        } else if ([KEYS.STRENGTH, KEYS.WILL].includes(trait)) {
            // TODO ech 2026-09-09 - apply UNCONSCIOUS active effect?
            const chatContent = `<strong>${target.name}</strong> went unconscious!`;
            await displayMessage.execute({message: chatContent});
        }
    }
}