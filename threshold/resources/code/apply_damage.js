//*********************************************
// This applies damage to the proper traits in
// the correct order.
//*********************************************

const target = scope.target;
const totalDamage = scope.damage;
// const armorCounts = scope.armorCounts || false;
if (!target) {
    console.log('Hey moron, you need to supply the target');
    return null;
}

const KEYS = {
    AGILITY: "dexterity",
    ARMOR_CLASS: "system.primaryArmor.value",
    CHARISMA: "socialStanding",
    ENDURANCE: "endurance",
    ESSENCE: "alternative3",
    STRENGTH: "strength",
    WILL: "alternative2",
};
const PHYSICAL_TRAITS = [KEYS.ENDURANCE, KEYS.STRENGTH, KEYS.AGILITY]; // in order
const SPIRITUAL_TRAITS = [KEYS.ESSENCE, KEYS.WILL, KEYS.CHARISMA]; // in order

// TODO ech 2026-09-10 - take armor into account

let remaining = totalDamage;
for (const trait of PHYSICAL_TRAITS) { // TODO ech 2026-09-09 - add spiritual damage later
    if (remaining <= 0) {
        return;
    }
    let currentValue = target.system.characteristics[trait].current;
    if (currentValue === 0) {
        continue;
    }
    let currentDamage = target.system.characteristics[trait].damage;
    let loss = Math.min(currentValue, remaining);
    currentDamage += loss;
    remaining -= loss;
    // console.log("Key", trait, "Remaining", remaining, "Loss", loss, "new currentDamage", currentDamage);
    // apply currentDamage
    await target.update({['system.characteristics.' + trait + '.damage']: currentDamage});

    if (trait === KEYS.AGILITY && currentValue - loss === 0) {
        // TODO ech 2026-09-09 - mark DEAD
        console.log('Target went belly up')
    } else if (trait === KEYS.STRENGTH && currentValue - loss === 0) {
        // TODO ech 2026-09-09 - mark UNCONSCIOUS
        console.log('Target went unconscious')
    }
}