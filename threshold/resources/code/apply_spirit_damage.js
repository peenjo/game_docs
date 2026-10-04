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
            callback: (html) => {
                let d = parseInt(html.find('#totalDamage').val());
                if (isNaN(d) || d <= 0) return;
                // TODO ech 2026-10-03 - figure out wait/async for this
                let results = applyDamage.execute({target: actor, damage: d, spiritDamage: true});
                // if (results) {
                //     console.log(JSON.stringify(results, null, 2));
                // }
            }
        }
    },
    default: "apply"
}).render(true);