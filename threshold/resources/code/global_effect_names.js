//*******************************************
// Quick and dirty way of providing global
// constants without dealing with the Foundry
// glocal namespace.
//*******************************************

return {
    BLEEDING_SURGERY: "bleeding - surgery", // surgery includes treatement and first-aid
    BLEEDING_TREAT: "bleeding - treatment", // treatment includes first-aid
    BLEEDING_FA: "bleeding - first aid",
    DEAD: "dead",
    DISARMED: "disarmed",
    LOCKED: "locked",
    MOVED: "moved", // not used directly: a convenience to match any other MOVED effects
    MOVED_LONG_ANY_FORWARD: "moved 2m anywhere forward",
    MOVED_LONG_BACK: "moved 2m directly back",
    MOVED_LONG_FORWARD: "moved 2m directly forward",
    MOVED_SHORT_ANYWHERE: "moved 1m in an appropriate direction",
    MOVED_SHORT_BACK: "moved 1m directly back",
    MOVED_SHORT_DIAGONAL: "moved 1m diagonally back",
    MOVED_SHORT_FORWARD: "moved 1m directly forward",
    PRONE: "prone",
    STUNNED: "stunned",
    SUPRESSED: "supressed",
    UNCONSCIOUS: "unconscious",
};
