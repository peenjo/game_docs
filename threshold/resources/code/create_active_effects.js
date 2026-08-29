//*******************************************
// This does the heavy lifting of creating
// specific Foundry Active Effect objects
// given a list of effect names.
//*******************************************

// concentrate 'magic values' here
const THRESHOLD_VALUES = {
    MOVEMENT: "system.movement.walk",
    ARMOR_CLASS: "system.primaryArmor.value",
    AGILITY: "system.characteristics.dexterity.value",
    EFFECT_TYPE: {MULTIPLY: 1, ADD: 2, DOWNGRADE: 3, UPGRADE: 4, OVERRIDE: 5, CUSTOM: 0}, // CUSTOM throws error
};

// crappy way of having global values without dealing with Foundry directly
const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
const EFFECTS = await getGlobalEffectNames.execute();

// names of effect passed in by calling macro
const effectNames = scope.effectNames;
if (!effectNames) {
    console.log('Hey moron, you need to supply effect names');
    return null;
}

let effects = [];
for (const effectName of effectNames) {
    // base information for effect (no timers or mods)
    let effectData = {
        name: effectName,
        // TODO ech 2026-08-27 - ignores this and supplies aura icon from same directory
        icon: "icons/svg/daze.svg",
    };

    // effect setting movement to zero
    const noMovementEffects = [
        EFFECTS.DEAD,
        EFFECTS.PRONE,
        EFFECTS.STUNNED,
        EFFECTS.SUPRESSED,
        EFFECTS.UNCONSCIOUS,
    ];
    if (noMovementEffects.includes(effectName)) {
        effectData.changes = [{
            key: THRESHOLD_VALUES.MOVEMENT,
            mode: THRESHOLD_VALUES.EFFECT_TYPE.OVERRIDE,
            value: "0",
            priority: 40
        }];
    }

    // this covers all movement reduction effects
    if (effectName.includes(EFFECTS.MOVEMENT_REDUCED)) {
        let modifier = effectName.slice(-2); // get last two characters: -2, -4, -6
        effectData.changes = [{
            key: THRESHOLD_VALUES.MOVEMENT,
            mode: THRESHOLD_VALUES.EFFECT_TYPE.ADD,
            value: modifier,
            priority: 20
        }];
    }

    // effects with timers
    // TODO ech 2026-08-27 - figure out niceties of expiration
    if (effectName.includes(EFFECTS.STUNNED) || effectName.includes(EFFECTS.SUPRESSED)) {
        effectData.duration = {turns: 1, expiry: "turnEnd"};
    } else if (effectName.includes(EFFECTS.MOVED)) { // this one covers all 'moved' effects
        effectData.duration = {turns: 0, expiry: "turnStart"};
    }

    effects.push(effectData);
}

return effects;
