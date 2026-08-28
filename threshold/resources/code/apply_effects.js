//*********************************************
// Given an array of effect names, this creates
// and applies Foundry Active Effects to the
// target. It also posts informational messages
// to the Foundry Chat Window.
//*********************************************

// get all currently targeted tokens by the user
const targets = Array.from(game.user.targets);

// ensure exactly one target is selected
if (targets.length === 0) {
    ui.notifications.warn("Please target a token first! (Use the Target tool or hover and press 'T')");
    return null;
}
if (targets.length > 1) {
    ui.notifications.warn("Too many targets! Please target only ONE token at a time to stun.");
    return null;
}

// grab the single targeted token
const target = targets[0];

// get the user's controlled token/actor doing the action
// TODO ech 2026-08-28 - not sure this is the way to go
const attacker = canvas.tokens.controlled[0];

// ensure the user actually has a token selected to perform the action
if (!attacker) { // TODO ech 2026-08-27 - not a totally accurate message for a GM
    ui.notifications.warn("Please select your own character token first to perform the action!");
    return null;
}

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
    ui.notifications.warn("Only a Gamemaster can perform this action.");
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
    await ChatMessage.create({
        content: chatContent, speaker: ChatMessage.getSpeaker({token: attacker})
    });

}