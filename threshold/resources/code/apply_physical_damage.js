const selectedTokens = canvas.tokens.controlled;
if (selectedTokens.length !== 1) {
    ui.notifications.warn("Select ONE token");
    return;
}
const actor = selectedTokens[0].actor;
const applyDamage = game.macros.getName("Apply_Damage");

const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
const EFFECTS = await getGlobalEffectNames.execute();

// TODO ech 2026-09-10 - improve the dialog
new Dialog({
    title: "Apply Physical Damage",
    content:
        `
        <div class="dialog-form">
            <label>Total Damage</label>
            <input type="number" id="totalDamage" step="1" value="0">
            
            <label>Piercing Damage</label>
            <input type="number" id="piercingDamage" step="1" value="0">
        </div>
    `,
    buttons: {
        apply: {
            icon: '',
            label: "Apply",
            callback: async (html) => {
                const d = parseInt(html.find('#totalDamage').val());
                let p = parseInt(html.find('#piercingDamage').val());
                if (isNaN(d) || isNaN(p)) return;
                if (d > 0) {
                    if (p < 0) p = 0;
                    else if (p > d) p = d;
                    let results = await applyDamage.execute({target: actor, damage: d, piercingDamage: p});
                    if (results) {
                        const displayMessage = game.macros.getName("Display_Special_Effect_Message");

                        let res = JSON.stringify(results, null, 2).slice(1, -1);
                        await displayMessage.execute({message: res, onlyToGMs: true, title: "Physical Damage Report"});

                        if (results.final_status === EFFECTS.DEAD) {
                            await displayMessage.execute({message: `<strong>${actor.name}</strong> just DIED!`});
                            // don't bother with special effect message - it's dead, Jim
                        } else {
                            if (results.final_status === EFFECTS.UNCONSCIOUS) {
                                await displayMessage.execute({message: `<strong>${actor.name}</strong> went unconscious!`});
                            }
                            if (results.special_effect_table) {
                                await displayMessage.execute({
                                    message: `Roll on the <strong>${results.special_effect_table} Special Effects Table</strong>`,
                                    onlyToGMs: true
                                });
                            }
                        }
                    }
                }
            }
        }
    },
    default: "apply"
}).render(true);