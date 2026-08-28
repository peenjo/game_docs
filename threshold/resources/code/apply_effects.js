//*********************************************
// Given an array of effect names, this creates
// and applies Foundry Active Effects to the
// target. It then posts informational messages
// to the Foundry Chat Window.
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

// list of effects passed in from caller macro
const activeEffects = scope.activeEffects;
if (!activeEffects) {
    console.log('hey moron, you need to supply the list of effect names');
    return null;
}

// create the active effects Foundry resources to be applied to the target
const createEffects = game.macros.getName("Create_Active_Effects");
const effects = await createEffects.execute({effectNames: activeEffects});
//console.log(effects);

// apply the all active effects directly to the targeted token's actor
try {
    await target.actor.createEmbeddedDocuments("ActiveEffect", effects);
} catch (error) {
    // TODO ech 2026-08-28 - this masks the actual error depending on how it's handled in the module code
    ui.notifications.warn("Only a GameMaster can perform this action.");
    return null;
}

// create chat messages for each of the active effects
// TODO ech 2026-08-28 - make the messages smarter
for (const effect of effects) {
    let chatContent = `
    <div class="twodsix-chat-card">
      <p><strong>${target.name}</strong> is ${effect.name}!</p>
    </div>
  `;

    // post the chat message object in Foundry
    await ChatMessage.create({content: chatContent});
}