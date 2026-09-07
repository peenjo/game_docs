//*********************************************
// This creates and applies a Foundry Active
// Effect to the selected token.
//
// It is a bookkeeping feature for the GM to
// track NPC movement in a combat turn.
//*********************************************

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
    duration: {turns: 0, expiry: "roundEnd"}, // clear at end of every round
};

// apply the all active effects directly to the targeted token's actor
await target.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);