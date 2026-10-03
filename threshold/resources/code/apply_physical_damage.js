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
                // TODO ech 2026-10-02 - make this clearer
                if (!isNaN(d) && d > 0) {
                    if (!isNaN(p)) {
                        if (p < 0) p = 0;
                        else if (p > d) p = d;
                    }
                    applyDamage.execute({target: actor, damage: d, piercingDamage: p});
                }
                // TODO ech 2026-09-27 - message GM about light/medium/heavy effect
            }
        }
    },
    default: "apply"
}).render(true);