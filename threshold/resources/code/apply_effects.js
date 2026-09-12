//*********************************************
// Given an array of effect names, this creates
// and applies Foundry Active Effects to the
// target. It then posts informational messages
// to the Foundry Chat Window.
//*********************************************

// list of effects passed in from caller macro
const activeEffects = scope.activeEffects;
if (!activeEffects) {
    console.log('hey moron, you need to supply the list of effect names');
    return null;
}

// ech 2026-09-08 - This makes all the expired events
// actually go away instead of staying in the event tab
// as zombie entries. It only needs to be set once on
// game load, but that involves
// Hooks.once("init", () => {...
// code in a custom module which turns into a whole
// thing. This is redundant but WAY simpler.
CONFIG.ActiveEffect.expiryAction = 'delete';

const selectedTokens = canvas.tokens.controlled;
// ensure exactly one token is selected
if (selectedTokens.length === 0) {
    ui.notifications.warn("Please select a token");
    return;
}
if (selectedTokens.length > 1) {
    ui.notifications.warn("Too many selected tokens. Please select only ONE token.");
    return;
}
const target = selectedTokens[0];
const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
const EFFECTS = await getGlobalEffectNames.execute();

// create the active effects Foundry resources to be applied to the target
const createEffects = game.macros.getName("Create_Active_Effects");
const effects = await createEffects.execute({effectNames: activeEffects});

// apply the all active effects directly to the target token's actor

await target.actor.createEmbeddedDocuments("ActiveEffect", effects);

function isReductionEffect(effectName) {
    return (effectName.includes(EFFECTS.MOVEMENT_REDUCED) ||
        effectName.includes(EFFECTS.AGILITY_REDUCED) ||
        effectName.includes(EFFECTS.CHARISMA_REDUCED) ||
        effectName.includes(EFFECTS.INITIATIVE_REDUCED));
}

// create chat messages for each of the active effects
const displayChatMessage = game.macros.getName("Display_Chat_Message");
for (const effect of effects) {
    let mess = 'is ' + effect.name; // simple default
    if (isReductionEffect(effect.name)) {
        mess = 'gets ' + effect.name;
    } else if (effect.name === EFFECTS.BLEEDING) {
        mess = 'starts ' + effect.name;
    } else if (effect.name.includes(EFFECTS.NEEDS)) {
        mess = effect.name;
    } else if (effect.name.includes(EFFECTS.NU)) {
        mess = 'needs a ' + effect.name;
    }

    const chatContent = `<strong>${target.name}</strong> ${mess}!`;
    await displayChatMessage.execute({message: chatContent});
}