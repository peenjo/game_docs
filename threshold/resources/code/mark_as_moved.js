//*********************************************
// This creates and applies a Foundry Active
// Effect to the selected token.
//
// It is a bookkeeping feature for the GM to
// track NPC movement in a combat turn.
//*********************************************

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
    ui.notifications.warn("Please select a token first!");
    return null;
}
if (selectedTokens.length > 1) {
    ui.notifications.warn("Too many selected tokens! Please select only ONE token at a time.");
    return null;
}
const target = selectedTokens[0];

const effectData = {
    name: "Character Moved",
    img: "icons/svg/walk.svg",
    duration: {turns: 0, expiry: "roundEnd"},
};

// apply the active effect directly to the target token's actor
await target.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);