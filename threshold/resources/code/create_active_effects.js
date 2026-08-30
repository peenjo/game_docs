//*******************************************
// This does the heavy lifting of creating
// specific Foundry Active Effect objects
// given a list of effect names.
//*******************************************

// concentrate 'magic values' here
const THRESHOLD_VALUES = {
    AGILITY: "system.characteristics.dexterity.value",
    CHARISMA: "system.characteristics.socialStanding.value",
    INITIATIVE_MOD: "system.characteristics.alternative1.mod",
    MOVEMENT: "system.movement.walk",
    ARMOR_CLASS: "system.primaryArmor.value",
    EFFECT_TYPE: {MULTIPLY: 1, ADD: 2, DOWNGRADE: 3, UPGRADE: 4, OVERRIDE: 5, CUSTOM: 0}, // CUSTOM throws error
};

// crappy way of having global values without dealing with Foundry directly
const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
const EFFECTS = await getGlobalEffectNames.execute();

const iconMap = new Map();
// TODO ech 2026-08-29 - not married to any of these choices, but it's a start
iconMap.set(EFFECTS.AGILITY_REDUCED, "https://assets.forge-vtt.com/bazaar/systems/twodsix/assets/assets/icons/athletics-dexterity.svg");
iconMap.set(EFFECTS.BLEEDING, "icons/svg/blood.svg");
iconMap.set(EFFECTS.CHARISMA_REDUCED, "https://assets.forge-vtt.com/640b5615b76cde9b16737fba/moulinette/images/gameicons/pummeled.svg");
iconMap.set(EFFECTS.DEAD, "icons/svg/skull.svg");
iconMap.set(EFFECTS.DISARMED, "https://assets.forge-vtt.com/640b5615b76cde9b16737fba/moulinette/images/gameicons/hand-bandage.svg");
iconMap.set(EFFECTS.INITIATIVE_REDUCED, "https://assets.forge-vtt.com/640b5615b76cde9b16737fba/moulinette/images/gameicons/empty-chessboard.svg");
iconMap.set(EFFECTS.LOCKED, "https://assets.forge-vtt.com/640b5615b76cde9b16737fba/moulinette/images/gameicons/internal-injury.svg");
iconMap.set(EFFECTS.MOVED, "https://assets.forge-vtt.com/640b5615b76cde9b16737fba/moulinette/images/gameicons/push.svg");
iconMap.set(EFFECTS.MOVEMENT_REDUCED, "https://assets.forge-vtt.com/640b5615b76cde9b16737fba/moulinette/images/gameicons/knee-bandage.svg");
iconMap.set(EFFECTS.PRONE, "icons/svg/falling.svg");
iconMap.set(EFFECTS.STUNNED, "icons/svg/daze.svg");
iconMap.set(EFFECTS.SUPRESSED, "icons/svg/daze.svg");
iconMap.set(EFFECTS.UNCONSCIOUS, "icons/svg/unconscious.svg");

// names of effect passed in by calling macro
const effectNames = scope.effectNames;
if (!effectNames) {
    console.log('Hey moron, you need to supply effect names');
    return null;
}

let effects = [];
for (const effectName of effectNames) {
    let iconPath = "icons/svg/aura.svg"; // default icon
    // match on categories, not just single entries
    const firstWord = effectName.split(" ")[0];
    if (iconMap.has(firstWord)) {
        iconPath = iconMap.get(firstWord);
    }

    // base information for effect (no timers or mods)
    let effectData = {
        name: effectName,
        img: iconPath,
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
            value: 0,
            priority: 40 // happens after any reduction effects
        }];
    }

    // this covers all reduction effects
    if (effectName.includes(EFFECTS.MOVEMENT_REDUCED) ||
        effectName.includes(EFFECTS.AGILITY_REDUCED) ||
        effectName.includes(EFFECTS.CHARISMA_REDUCED) ||
        effectName.includes(EFFECTS.INITIATIVE_REDUCED)) {
        const modifier = effectName.slice(-2); // get last two characters: -2, -4, -6
        let thresholdKey = THRESHOLD_VALUES.MOVEMENT;
        if (effectName.includes(EFFECTS.AGILITY_REDUCED)) {
            thresholdKey = THRESHOLD_VALUES.AGILITY;
        } else if (effectName.includes(EFFECTS.CHARISMA_REDUCED)) {
            thresholdKey = THRESHOLD_VALUES.CHARISMA;
        } else if (effectName.includes(EFFECTS.INITIATIVE_REDUCED)) {
            thresholdKey = THRESHOLD_VALUES.INITIATIVE_MOD;
        }
        effectData.changes = [{
            key: thresholdKey,
            mode: THRESHOLD_VALUES.EFFECT_TYPE.ADD,
            value: modifier,
            priority: 20 // happens before any override effects
        }];
    }

    // effects with timers
    // TODO ech 2026-08-27 - figure out niceties of expiration
    if (effectName.includes(EFFECTS.STUNNED) || effectName.includes(EFFECTS.SUPRESSED)) {
        effectData.duration = {turns: 1, expiry: "turnEnd"};
    } else if (effectName.includes(EFFECTS.MOVED)) { // this one covers all 'moved' effects
        effectData.duration = {turns: 0, expiry: "turnStart"};
    } else {
        // ech 2026-08-29 - stupid hack to have a 'temporary' permanent effect to show icon. sigh...
        effectData.duration = {expiry: "combatEnd"};
    }

    effects.push(effectData);
}

return effects;
