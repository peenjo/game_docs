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
    console.log('Hey moron, you need to supply the target');
    return null;
}
const totalDamage = scope.damage || 0; // damage to be applied
const ignoreArmor = scope.ignoreArmor || false; // armor counts by default
const spiritualDamage = scope.spiritualDamage || false; // physical damage by default

const KEYS = {
    AGILITY: "dexterity",
    ARMOR_CLASS: "primaryArmor",
    CHARISMA: "socialStanding",
    ENDURANCE: "endurance",
    ESSENCE: "alternative3",
    STRENGTH: "strength",
    WILL: "alternative2",
};
const PHYSICAL_TRAITS = [KEYS.ENDURANCE, KEYS.STRENGTH, KEYS.AGILITY]; // in order
const SPIRITUAL_TRAITS = [KEYS.ESSENCE, KEYS.WILL, KEYS.CHARISMA]; // in order
const TRAITS = spiritualDamage ? SPIRITUAL_TRAITS : PHYSICAL_TRAITS; // physical or spiritual

let remaining = totalDamage;
// TODO ech 2026-09-10 - is there such a thing as 'spirit armor'?
if (!ignoreArmor) {
    const armorValue = target.system[KEYS.ARMOR_CLASS].value;
    remaining -= armorValue;
}

const displayChatMessage = game.macros.getName("Display_Chat_Message");

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

    // TODO ech 2026-09-10 - does spirit combat also cause unconsciousness and death?
    if (trait === KEYS.AGILITY && currentValue - loss === 0) {
        // TODO ech 2026-09-09 - apply DEAD active effect?
        const chatContent = `<strong>${target.name}</strong> just bled out and DIED!`;
        await displayChatMessage.execute({message: chatContent});
    } else if (trait === KEYS.STRENGTH && currentValue - loss === 0) {
        // TODO ech 2026-09-09 - apply UNCONSCIOUS active effect?
        const chatContent = `<strong>${target.name}</strong> went unconscious!`;
        await displayChatMessage.execute({message: chatContent});
    }
}