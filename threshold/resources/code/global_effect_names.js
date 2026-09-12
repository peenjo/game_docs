//*******************************************
// Quick and dirty way of providing global
// constants without dealing with the Foundry
// glocal namespace.
//*******************************************

return {
    AGILITY_REDUCED: "agility", // not used directly: a convenience to match any other AGILITY effect
    AGILITY_REDUCED_MINOR: "agility -1",
    AGILITY_REDUCED_LOW: "agility -2",
    AGILITY_REDUCED_MEDIUM: "agility -4",
    AGILITY_REDUCED_HIGH: "agility -6",
    BLEEDING: "bleeding",
    CHARISMA_REDUCED: "charisma", // not used directly: a convenience to match any other CHARISMA effect
    CHARISMA_REDUCED_LOW: "charisma -2",
    CHARISMA_REDUCED_MEDIUM: "charisma -4",
    CHARISMA_REDUCED_HIGH: "charisma -6",
    DEAD: "dead",
    DISARMED: "disarmed",
    INITIATIVE_REDUCED: "initiative", // not used directly: a convenience to match any other INITIATIVE effect
    INITIATIVE_REDUCED_LOW: "initiative -2",
    INITIATIVE_REDUCED_MEDIUM: "initiative -4",
    INITIATIVE_REDUCED_HIGH: "initiative -6",
    LOCKED: "in a lock",
    MOVED: "moved", // not used directly: a convenience to match any other MOVED effect
    MOVED_LONG_ANY_FORWARD: "moved 2m anywhere forward",
    MOVED_LONG_ANYWHERE: "moved 2m in an appropriate direction",
    MOVED_LONG_BACK: "moved 2m directly back",
    MOVED_LONG_FORWARD: "moved 2m directly forward",
    MOVED_SHORT_ANYWHERE: "moved 1m in an appropriate direction",
    MOVED_SHORT_BACK: "moved 1m directly back",
    MOVED_SHORT_DIAGONAL: "moved 1m diagonally",
    MOVED_SHORT_FORWARD: "moved 1m directly forward",
    MOVED_SHORT_SIDEWAYS: "moved 1m sideways",
    MOVEMENT_REDUCED: "movement", // not used directly: a convenience to match any other MOVEMENT effect
    MOVEMENT_REDUCED_LOW: "movement -2",
    MOVEMENT_REDUCED_MEDIUM: "movement -4",
    MOVEMENT_REDUCED_HIGH: "movement -6",
    NEEDS: "needs", // not used directly: a convenience to match any other NEEDS effect
    NEEDS_FIRST_AID: "needs first aid",
    NEEDS_TREATMENT: "needs treatment", // treatment requires first aid
    NEEDS_SURGERY: "needs surgery", // surgery requires treatment and first aid
    NU: "Nu", // not used directly: a convenience to match any other NU effect
    NU_ARM: "NuArm",
    NU_EYE: "NuEye",
    NU_FACE: "NuFace",
    NU_FINGER: "NuFinger",
    NU_FOOT: "NuFoot",
    NU_HAND: "NuHand",
    NU_JAW: "NuJaw",
    NU_LEG: "NuLeg",
    NU_NOSE: "NuNose",
    NU_ORGANS: "NuOrgans",
    NU_TOE: "NuToe",
    PRONE: "prone",
    STUNNED: "stunned",
    SUPPRESSED: "suppressed", // TODO ech 2026-09-11 - deprecated
    UNCONSCIOUS: "unconscious",
}