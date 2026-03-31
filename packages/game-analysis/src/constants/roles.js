/**
 * Werewolf game role definitions.
 * Each role belongs to a faction: "wolf", "villager", or "god".
 * Gods are special villager-aligned roles with abilities.
 */

export const FACTIONS = {
    WOLF: "wolf",
    VILLAGER: "villager",
    GOD: "god",
};

export const FACTION_LABELS = {
    [FACTIONS.WOLF]: "狼人",
    [FACTIONS.VILLAGER]: "村民",
    [FACTIONS.GOD]: "神职 (好人阵营)",
};

export const FACTION_COLORS = {
    [FACTIONS.WOLF]: "#cf1322",
    [FACTIONS.VILLAGER]: "#389e0d",
    [FACTIONS.GOD]: "#1890ff",
};

export const WINNING_FACTIONS = {
    WOLF: "wolf",
    VILLAGE: "village",
};

export const WINNING_FACTION_LABELS = {
    [WINNING_FACTIONS.WOLF]: "狼人阵营",
    [WINNING_FACTIONS.VILLAGE]: "好人阵营",
};

export const WINNING_FACTION_COLORS = {
    [WINNING_FACTIONS.WOLF]: "#cf1322",
    [WINNING_FACTIONS.VILLAGE]: "#389e0d",
};

export const DEFAULT_ROLES = [
    { key: "werewolf", name: "狼人", faction: FACTIONS.WOLF },
    { key: "wolf_king", name: "狼王", faction: FACTIONS.WOLF },
    { key: "white_wolf", name: "白狼王", faction: FACTIONS.WOLF },
    { key: "villager", name: "村民", faction: FACTIONS.VILLAGER },
    { key: "seer", name: "预言家", faction: FACTIONS.GOD },
    { key: "witch", name: "女巫", faction: FACTIONS.GOD },
    { key: "hunter", name: "猎人", faction: FACTIONS.GOD },
    { key: "guard", name: "守卫", faction: FACTIONS.GOD },
    { key: "idiot", name: "白痴", faction: FACTIONS.GOD },
    { key: "cupid", name: "丘比特", faction: FACTIONS.GOD },
];

export const getRoleByKey = (key) => DEFAULT_ROLES.find((r) => r.key === key);

export const getFactionForRole = (roleKey) => {
    const role = getRoleByKey(roleKey);
    return role ? role.faction : FACTIONS.VILLAGER;
};
