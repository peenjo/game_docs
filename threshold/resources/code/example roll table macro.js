const getGlobalEffectNames = game.macros.getName("Global_Effect_Names");
const EFFECTS = await getGlobalEffectNames.execute();

// specific effect(s) to invoke for this table entry
const effects = [EFFECTS.MOVED_SHORT_BACK, EFFECTS.STUNNED];

const applyEffects = game.macros.getName("Apply_Effects");
await applyEffects.execute({activeEffects : effects});