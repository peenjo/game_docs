// Hook for any recurring  events during combat. Fires once per round.
// Currently only implements bleeding effects.

// check for previous instantiation in global state
globalThis.thresholdData = globalThis.thresholdData || {};
// if exists, we're done
if (globalThis.thresholdData.combatHookId != null) return;


const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
const EFFECTS = await getGlobalEffectNames.execute();

const applyDamage = game.macros.getName("Apply_Damage");

const hook_id = Hooks.on("combatRound", async (combat, updateData, updateOptions) => {
    // Only fire on forward progression
    if (updateOptions.direction < 0) return;

    for (const combatant of combat.combatants) {
        const actor = combatant.actor;
        // Check if the actor has an active bleeding effect
        const effect = actor.effects.find(
            e => e.name === EFFECTS.BLEEDING && !e.disabled
        );
        if (!effect) continue;

        // apply damage, which is a set of complex calculations
        await applyDamage.execute({target: actor, damage: 2, ignoreArmor: true});

        let chatContent = `
            <div class="twodsix-chat-card">
                <p><strong>${actor.name}</strong> is still ${effect.name} and took more damage!</p>
            </div>
        `;
        // post the chat message object in Foundry
        await ChatMessage.create({
            content: chatContent, speaker: {alias: "Special Effect"}
        });
    }
});

// store hook id as a flag for 'already created'
globalThis.thresholdData.combatHookId = hook_id;

