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

/**
 * Game modes
 */
export const GAME_MODES = {
    STANDARD: "standard",
    DOUBLE_IDENTITY: "double_identity",
};

export const GAME_MODE_LABELS = {
    [GAME_MODES.STANDARD]: "标准模式",
    [GAME_MODES.DOUBLE_IDENTITY]: "双身份模式",
};

export const DEFAULT_ROLES = [
    { key: "werewolf", name: "狼人", faction: FACTIONS.WOLF },
    { key: "wolf_king", name: "狼王", faction: FACTIONS.WOLF },
    { key: "white_wolf", name: "白狼王", faction: FACTIONS.WOLF },
    { key: "hidden_wolf", name: "隐狼", faction: FACTIONS.WOLF },
    { key: "wolf_beauty", name: "狼美人", faction: FACTIONS.WOLF },
    { key: "half_blood", name: "混血儿", faction: FACTIONS.VILLAGER, needsSideOverride: true },
    { key: "villager", name: "村民", faction: FACTIONS.VILLAGER },
    { key: "seer", name: "预言家", faction: FACTIONS.GOD },
    { key: "witch", name: "女巫", faction: FACTIONS.GOD },
    { key: "hunter", name: "猎人", faction: FACTIONS.GOD },
    { key: "guard", name: "守卫", faction: FACTIONS.GOD },
    { key: "idiot", name: "白痴", faction: FACTIONS.GOD },
    { key: "cupid", name: "丘比特", faction: FACTIONS.GOD },
];

/** Default role keys that cannot be removed */
export const DEFAULT_ROLE_KEYS = new Set(DEFAULT_ROLES.map((r) => r.key));

/**
 * Get a role by key, checking custom roles first (so overrides work),
 * then falling back to defaults.
 */
export const getRoleByKey = (key, customRoles = []) => {
    const custom = customRoles.find((r) => r.key === key);
    if (custom) return custom;
    return DEFAULT_ROLES.find((r) => r.key === key);
};

/**
 * Get the faction for a given role key.
 */
export const getFactionForRole = (roleKey, customRoles = []) => {
    const role = getRoleByKey(roleKey, customRoles);
    return role ? role.faction : FACTIONS.VILLAGER;
};

/**
 * Merge default roles with custom roles, deduplicating by key.
 * Custom roles with same key as a default will override the default.
 */
export const getAllRoles = (customRoles = []) => {
    const customKeys = new Set(customRoles.map((r) => r.key));
    const defaults = DEFAULT_ROLES.filter((r) => !customKeys.has(r.key));
    return [...defaults, ...customRoles];
};

/**
 * Generate a key from a role name (for user-created roles).
 */
export const generateRoleKey = (name) =>
    `custom_${name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_\u4e00-\u9fff]/g, "")}_${Date.now().toString(36)}`;
