//*******************************************
// Quick and dirty way of providing global
// constants without dealing with the Foundry
// glocal namespace.
//*******************************************

return {
    AGILITY_REDUCED: "agility", // not used directly: a convenience to match any other AGILITY effect
    AGILITY_REDUCED_LOW: "agility -2",
    AGILITY_REDUCED_MEDIUM: "agility -4",
    AGILITY_REDUCED_HIGH: "agility -6",
    BLEEDING_SURGERY: "bleeding - surgery", // surgery includes treatement and first-aid
    BLEEDING_TREAT: "bleeding - treatment", // treatment includes first-aid
    BLEEDING_FA: "bleeding - first aid",
    DEAD: "dead",
    DISARMED: "disarmed",
    INITIATIVE_REDUCED: "initiative", // not used directly: a convenience to match any other INITIATIVE effect
    INITIATIVE_REDUCED_LOW: "initiative -2",
    INITIATIVE_REDUCED_MEDIUM: "initiative -4",
    INITIATIVE_REDUCED_HIGH: "initiative -6",
    LOCKED: "locked",
    MOVED: "moved", // not used directly: a convenience to match any other MOVED effect
    MOVED_LONG_ANY_FORWARD: "moved 2m anywhere forward",
    MOVED_LONG_BACK: "moved 2m directly back",
    MOVED_LONG_FORWARD: "moved 2m directly forward",
    MOVED_SHORT_ANYWHERE: "moved 1m in an appropriate direction",
    MOVED_SHORT_BACK: "moved 1m directly back",
    MOVED_SHORT_DIAGONAL: "moved 1m diagonally back",
    MOVED_SHORT_FORWARD: "moved 1m directly forward",
    MOVEMENT_REDUCED: "movement", // not used directly: a convenience to match any other MOVEMENT effect
    MOVEMENT_REDUCED_LOW: "movement -2",
    MOVEMENT_REDUCED_MEDIUM: "movement -4",
    MOVEMENT_REDUCED_HIGH: "movement -6",
    PRONE: "prone",
    STUNNED: "stunned",
    SUPRESSED: "supressed",
    UNCONSCIOUS: "unconscious",
}