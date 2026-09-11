const selectedTokens = canvas.tokens.controlled;
if (selectedTokens.length !== 1) {
    ui.notifications.warn("Select ONE token");
    return null;
}
const target = selectedTokens[0].actor;
const applyDamage = game.macros.getName("Apply_Damage");

// TODO ech 2026-09-10 - maybe improve the dialog
new Dialog({
    title: "Apply Spirit Damage",
    content: `<input type="number" id="damageInput" value="0">`,
    buttons: {
        apply: {
            icon: '',
            label: "Apply",
            callback: (html) => {
                let d = parseInt(html.find('#damageInput').val());
                if (!isNaN(d) && d > 0) {
                    applyDamage.execute({target: actor, damage: d, ignoreArmor: true, spiritualDamage: true});
                }
            }
        }
    },
    default: "apply"
}).render(true);