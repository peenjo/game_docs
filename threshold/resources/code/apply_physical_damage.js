const selectedTokens = canvas.tokens.controlled;
if (selectedTokens.length !== 1) {
    ui.notifications.warn("Select ONE token");
    return;
}
const actor = selectedTokens[0].actor;
const applyDamage = game.macros.getName("Apply_Damage");

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
            callback: (html) => {
                const d = parseInt(html.find('#totalDamage').val());
                let p = parseInt(html.find('#piercingDamage').val());
                if (isNaN(d) || isNaN(p)) return;
                if (d > 0) {
                    if (p < 0) p = 0;
                    else if (p > d) p = d;
                    // TODO ech 2026-10-03 - figure out wait/async for this
                    let results = applyDamage.execute({target: actor, damage: d, piercingDamage: p});
                    // if (results) {
                    //     console.log(JSON.stringify(results, null, 2));
                    // }
                }
            }
        }
    },
    default: "apply"
}).render(true);