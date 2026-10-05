const selectedTokens = canvas.tokens.controlled;
if (selectedTokens.length !== 1) {
    ui.notifications.warn("Select ONE token");
    return;
}
const actor = selectedTokens[0].actor;
const applyDamage = game.macros.getName("Apply_Damage");

// TODO ech 2026-09-10 - maybe improve the dialog
new Dialog({
    title: "Apply Spirit Damage",
    content:
        `
        <div class="dialog-form">
            <label>Damage</label>
            <input type="number" id="totalDamage" step="1" value="0">
        </div>
    `,
    buttons: {
        apply: {
            icon: '',
            label: "Apply",
            callback: async (html) => {
                let d = parseInt(html.find('#totalDamage').val());
                if (isNaN(d) || d <= 0) return;
                let results = await applyDamage.execute({target: actor, damage: d, spiritDamage: true});
                if (results) {
                    const displayMessage = game.macros.getName("Display_Special_Effect_Message");

                    let res = JSON.stringify(results, null, 2).slice(1, -1);
                    await displayMessage.execute({message: res, onlyToGMs: true, title: "Spiritual Damage Report"});
                }
            }
        }
    },
    default: "apply"
}).render(true);