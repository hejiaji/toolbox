import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import {
    Typography,
    Input,
    Button,
    Select,
    Card,
    Tag,
    Empty,
    List,
    Switch,
    Tabs,
    Popconfirm,
    message,
    Statistic,
    Table,
    Tooltip,
    DatePicker,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined,
    UploadOutlined,
    TeamOutlined,
    BarChartOutlined,
    HistoryOutlined,
    UserOutlined,
} from "@ant-design/icons";

import {
    DEFAULT_ROLES,
    FACTION_COLORS,
    FACTIONS,
    WINNING_FACTIONS,
    WINNING_FACTION_LABELS,
    WINNING_FACTION_COLORS,
    getRoleByKey,
} from "../constants/roles";
import {
    loadData,
    addGame,
    deleteGame,
    addPlayer,
    removePlayer,
    exportData,
    importData,
} from "../data/storage";
import {
    getOverallWinRate,
    getPlayerStats,
    getRoleStats,
    getGameHistory,
} from "../data/analytics";
import PieChart from "./PieChart";
import BarChart from "./BarChart";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const Page = styled.div`
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.75rem 1.5rem 2.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const Hero = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const HeroTitle = styled(Title)`
    && { margin: 0; }
`;

const HeroSubtitle = styled.p`
    margin: 0;
    max-width: 48rem;
    color: #666;
    font-size: 1rem;
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
`;

const StatCard = styled(Card)`
    && {
        border-radius: 14px;
        text-align: center;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }
`;

const SectionCard = styled(Card)`
    && {
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1.5rem;
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const FormLabel = styled.label`
    font-weight: 600;
    font-size: 0.85rem;
    color: #555;
`;

const PlayerEntryRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
`;

const DataActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const SectionTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
`;

const ChartSection = styled.div`
    margin-bottom: 1.5rem;
`;

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

const factionTag = (faction) => {
    const color =
        faction === FACTIONS.WOLF ? "red" : faction === FACTIONS.GOD ? "blue" : "green";
    const label =
        faction === FACTIONS.WOLF
            ? "Wolf"
            : faction === FACTIONS.GOD
            ? "God"
            : "Villager";
    return <Tag color={color}>{label}</Tag>;
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

function GameAnalysis() {
    // ---- state ----
    const [data, setData] = useState(() => loadData());
    const [activeTab, setActiveTab] = useState("record");
    const fileInputRef = useRef(null);

    // ---- record-game form state ----
    const [gameDate, setGameDate] = useState(null);
    const [gameWinner, setGameWinner] = useState(undefined);
    const [gamePlayers, setGamePlayers] = useState([]);
    // each entry: { name, role, alive }

    const [newPlayerName, setNewPlayerName] = useState("");

    const reload = useCallback(() => setData(loadData()), []);

    /* ---- Player management ---- */
    const handleAddKnownPlayer = () => {
        const trimmed = newPlayerName.trim();
        if (!trimmed) return;
        addPlayer(trimmed);
        setNewPlayerName("");
        reload();
    };

    const handleRemoveKnownPlayer = (name) => {
        removePlayer(name);
        reload();
    };

    /* ---- Game entry form ---- */
    const addPlayerToGame = (name) => {
        if (!name || gamePlayers.some((p) => p.name === name)) return;
        setGamePlayers([...gamePlayers, { name, role: undefined, alive: true }]);
    };

    const updateGamePlayer = (index, field, value) => {
        setGamePlayers((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const removeGamePlayer = (index) => {
        setGamePlayers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitGame = () => {
        if (!gameWinner) {
            message.warning("Please select which side won.");
            return;
        }
        if (gamePlayers.length < 2) {
            message.warning("Add at least 2 players.");
            return;
        }
        const missingRole = gamePlayers.some((p) => !p.role);
        if (missingRole) {
            message.warning("Please assign a role to every player.");
            return;
        }

        addGame({
            date: gameDate ? gameDate.format("YYYY-MM-DD") : new Date().toISOString().slice(0, 10),
            winner: gameWinner,
            players: gamePlayers.map((p) => ({
                name: p.name,
                role: p.role,
                alive: !!p.alive,
            })),
        });

        message.success("Game recorded!");
        setGameDate(null);
        setGameWinner(undefined);
        setGamePlayers([]);
        reload();
    };

    /* ---- Data import / export ---- */
    const handleExport = () => {
        const json = exportData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `werewolf_data_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        message.success("Data exported!");
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                importData(evt.target.result);
                reload();
                message.success("Data imported and merged!");
            } catch {
                message.error("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleDeleteGame = (id) => {
        deleteGame(id);
        reload();
        message.success("Game deleted.");
    };

    /* ---- Derived analytics ---- */
    const games = data.games || [];
    const overallWin = getOverallWinRate(games);
    const playerStats = getPlayerStats(games);
    const roleStats = getRoleStats(games);
    const history = getGameHistory(games);

    /* ---- Player stats table columns ---- */
    const playerColumns = [
        {
            title: "Player",
            dataIndex: "name",
            key: "name",
            render: (name) => <Text strong>{name}</Text>,
        },
        { title: "Games", dataIndex: "gamesPlayed", key: "gamesPlayed", sorter: (a, b) => a.gamesPlayed - b.gamesPlayed },
        { title: "Wins", dataIndex: "wins", key: "wins", sorter: (a, b) => a.wins - b.wins },
        { title: "Losses", dataIndex: "losses", key: "losses" },
        {
            title: "Win Rate",
            dataIndex: "winRate",
            key: "winRate",
            sorter: (a, b) => a.winRate - b.winRate,
            render: (v) => (
                <Tag color={v >= 0.5 ? "green" : "default"}>{Math.round(v * 100)}%</Tag>
            ),
        },
        {
            title: "Survival",
            dataIndex: "survivalRate",
            key: "survivalRate",
            sorter: (a, b) => a.survivalRate - b.survivalRate,
            render: (v) => `${Math.round(v * 100)}%`,
        },
        {
            title: "Roles played",
            dataIndex: "roles",
            key: "roles",
            render: (roles) =>
                Object.entries(roles).map(([key, count]) => {
                    const role = getRoleByKey(key);
                    return (
                        <Tooltip key={key} title={`${count} time${count > 1 ? "s" : ""}`}>
                            <Tag>{role ? role.name : key}</Tag>
                        </Tooltip>
                    );
                }),
        },
    ];

    /* ---- Role stats table columns ---- */
    const roleColumns = [
        {
            title: "Role",
            dataIndex: "roleKey",
            key: "roleKey",
            render: (key) => {
                const role = getRoleByKey(key);
                return (
                    <span>
                        {role ? role.name : key} {role ? factionTag(role.faction) : null}
                    </span>
                );
            },
        },
        { title: "Times Played", dataIndex: "timesPlayed", key: "timesPlayed", sorter: (a, b) => a.timesPlayed - b.timesPlayed },
        { title: "Wins", dataIndex: "wins", key: "wins", sorter: (a, b) => a.wins - b.wins },
        {
            title: "Win Rate",
            dataIndex: "winRate",
            key: "winRate",
            sorter: (a, b) => a.winRate - b.winRate,
            render: (v) => (
                <Tag color={v >= 0.5 ? "green" : v >= 0.3 ? "orange" : "red"}>
                    {Math.round(v * 100)}%
                </Tag>
            ),
        },
        {
            title: "Survival Rate",
            dataIndex: "survivalRate",
            key: "survivalRate",
            sorter: (a, b) => a.survivalRate - b.survivalRate,
            render: (v) => `${Math.round(v * 100)}%`,
        },
    ];

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */

    return (
        <Page>
            <Hero>
                <HeroTitle level={2}>🐺 Werewolf Game Analysis</HeroTitle>
                <HeroSubtitle>
                    Record games, track player performance, and analyse role win rates.
                    Data is stored as JSON in your browser — export anytime for backup.
                </HeroSubtitle>
            </Hero>

            {/* Quick stats */}
            <StatsRow>
                <StatCard size="small">
                    <Statistic title="Total Games" value={games.length} prefix={<HistoryOutlined />} />
                </StatCard>
                <StatCard size="small">
                    <Statistic
                        title="狼人胜场"
                        value={overallWin ? overallWin.wolf.wins : 0}
                        valueStyle={{ color: WINNING_FACTION_COLORS[WINNING_FACTIONS.WOLF] }}
                    />
                </StatCard>
                <StatCard size="small">
                    <Statistic
                        title="好人胜场"
                        value={overallWin ? overallWin.village.wins : 0}
                        valueStyle={{ color: WINNING_FACTION_COLORS[WINNING_FACTIONS.VILLAGE] }}
                    />
                </StatCard>
                <StatCard size="small">
                    <Statistic title="Players" value={data.players.length} prefix={<TeamOutlined />} />
                </StatCard>
            </StatsRow>

            {/* Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                {/* ===== TAB: Record a game ===== */}
                <TabPane tab={<span><PlusOutlined /> Record Game</span>} key="record">
                    <SectionCard>
                        <SectionTitle>New Game</SectionTitle>

                        <FormGrid>
                            <FormField>
                                <FormLabel>Date</FormLabel>
                                <DatePicker
                                    value={gameDate}
                                    onChange={setGameDate}
                                    style={{ width: "100%" }}
                                    placeholder="Select date"
                                />
                            </FormField>
                            <FormField>
                                <FormLabel>Winning side</FormLabel>
                                <Select
                                    value={gameWinner}
                                    onChange={setGameWinner}
                                    placeholder="Who won?"
                                    style={{ width: "100%" }}
                                >
                                    <Option value={WINNING_FACTIONS.WOLF}>
                                        🐺 狼人阵营
                                    </Option>
                                    <Option value={WINNING_FACTIONS.VILLAGE}>
                                        🏘️ 好人阵营
                                    </Option>
                                </Select>
                            </FormField>
                        </FormGrid>

                        <div style={{ marginTop: "1rem" }}>
                            <FormLabel>Add players to this game</FormLabel>
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                                <Select
                                    showSearch
                                    style={{ flex: 1 }}
                                    placeholder="Select or type a player name"
                                    onSelect={(v) => addPlayerToGame(v)}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <div style={{ padding: "4px 8px" }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Type a new name and press Enter to add
                                                </Text>
                                            </div>
                                        </>
                                    )}
                                    onSearch={() => {}}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                    onInputKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            addPlayerToGame(e.target.value.trim());
                                        }
                                    }}
                                    value={undefined}
                                >
                                    {data.players
                                        .filter((p) => !gamePlayers.some((gp) => gp.name === p))
                                        .map((p) => (
                                            <Option key={p} value={p}>
                                                {p}
                                            </Option>
                                        ))}
                                </Select>
                            </div>
                        </div>

                        {/* Player entries */}
                        {gamePlayers.length > 0 && (
                            <div style={{ marginTop: "1rem" }}>
                                <FormLabel>
                                    Players in this game ({gamePlayers.length})
                                </FormLabel>
                                {gamePlayers.map((p, idx) => (
                                    <PlayerEntryRow key={idx}>
                                        <UserOutlined />
                                        <Text strong style={{ minWidth: 80 }}>
                                            {p.name}
                                        </Text>
                                        <Select
                                            size="small"
                                            placeholder="Role"
                                            value={p.role}
                                            onChange={(v) => updateGamePlayer(idx, "role", v)}
                                            style={{ width: 150 }}
                                        >
                                            {DEFAULT_ROLES.map((r) => (
                                                <Option key={r.key} value={r.key}>
                                                    {r.name}
                                                </Option>
                                            ))}
                                        </Select>
                                        <span style={{ fontSize: "0.85rem", color: "#888" }}>
                                            Survived?
                                        </span>
                                        <Switch
                                            size="small"
                                            checked={p.alive}
                                            onChange={(v) => updateGamePlayer(idx, "alive", v)}
                                        />
                                        <Button
                                            size="small"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeGamePlayer(idx)}
                                        />
                                    </PlayerEntryRow>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: "1rem" }}>
                            <Button type="primary" onClick={handleSubmitGame}>
                                Save Game
                            </Button>
                        </div>
                    </SectionCard>
                </TabPane>

                {/* ===== TAB: Analytics ===== */}
                <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics">
                    {games.length === 0 ? (
                        <Empty description="No games recorded yet. Record some games to see analytics!" />
                    ) : (
                        <>
                            {/* Overall win distribution */}
                            <SectionCard style={{ marginBottom: "1.5rem" }}>
                                <SectionTitle>Overall Win Distribution</SectionTitle>
                                {overallWin && (
                                    <PieChart
                                        size={180}
                                        data={[
                                            {
                                                label: WINNING_FACTION_LABELS[WINNING_FACTIONS.WOLF],
                                                value: overallWin.wolf.wins,
                                                color: WINNING_FACTION_COLORS[WINNING_FACTIONS.WOLF],
                                            },
                                            {
                                                label: WINNING_FACTION_LABELS[WINNING_FACTIONS.VILLAGE],
                                                value: overallWin.village.wins,
                                                color: WINNING_FACTION_COLORS[WINNING_FACTIONS.VILLAGE],
                                            },
                                        ]}
                                    />
                                )}
                            </SectionCard>

                            {/* Role win rates */}
                            <SectionCard style={{ marginBottom: "1.5rem" }}>
                                <SectionTitle>Role Win Rates</SectionTitle>
                                {roleStats.length > 0 && (
                                    <BarChart
                                        data={roleStats.map((r) => {
                                            const role = getRoleByKey(r.roleKey);
                                            const faction = role
                                                ? role.faction
                                                : FACTIONS.VILLAGER;
                                            return {
                                                label: role ? role.name : r.roleKey,
                                                value: r.winRate,
                                                maxValue: 1,
                                                color: FACTION_COLORS[faction],
                                            };
                                        })}
                                    />
                                )}
                                <Table
                                    dataSource={roleStats}
                                    columns={roleColumns}
                                    rowKey="roleKey"
                                    size="small"
                                    pagination={false}
                                    style={{ marginTop: "1rem" }}
                                />
                            </SectionCard>

                            {/* Player stats */}
                            <SectionCard>
                                <SectionTitle>Player Performance</SectionTitle>
                                {playerStats.length > 0 && (
                                    <ChartSection>
                                        <Text type="secondary" style={{ fontSize: "0.85rem" }}>
                                            Win rate by player
                                        </Text>
                                        <BarChart
                                            data={playerStats.map((p) => ({
                                                label: p.name,
                                                value: p.winRate,
                                                maxValue: 1,
                                                color: p.winRate >= 0.5 ? "#389e0d" : "#faad14",
                                            }))}
                                        />
                                    </ChartSection>
                                )}
                                <Table
                                    dataSource={playerStats}
                                    columns={playerColumns}
                                    rowKey="name"
                                    size="small"
                                    pagination={false}
                                    scroll={{ x: 700 }}
                                />
                            </SectionCard>
                        </>
                    )}
                </TabPane>

                {/* ===== TAB: Game History ===== */}
                <TabPane tab={<span><HistoryOutlined /> History</span>} key="history">
                    {history.length === 0 ? (
                        <Empty description="No games recorded yet." />
                    ) : (
                        <List
                            dataSource={history}
                            renderItem={(game) => (
                                <SectionCard
                                    size="small"
                                    style={{ marginBottom: "0.75rem" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <div>
                                            <Tag color="default">{game.date || "No date"}</Tag>
                                            <Tag
                                                color={
                                                    game.winner === WINNING_FACTIONS.WOLF
                                                        ? "red"
                                                        : "green"
                                                }
                                            >
                                                {game.winner === WINNING_FACTIONS.WOLF
                                                    ? "🐺 狼人胜"
                                                    : "🏘️ 好人胜"}
                                            </Tag>
                                            <Tag>{game.players.length} players</Tag>
                                        </div>
                                        <Popconfirm
                                            title="Delete this game record?"
                                            onConfirm={() => handleDeleteGame(game.id)}
                                        >
                                            <Button size="small" danger type="text" icon={<DeleteOutlined />}>
                                                Delete
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                    <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                                        {game.players.map((p, i) => {
                                            const role = getRoleByKey(p.role);
                                            const faction = role ? role.faction : FACTIONS.VILLAGER;
                                            const color =
                                                faction === FACTIONS.WOLF
                                                    ? "red"
                                                    : faction === FACTIONS.GOD
                                                    ? "blue"
                                                    : "green";
                                            return (
                                                <Tooltip
                                                    key={i}
                                                    title={`${role ? role.name : p.role} — ${
                                                        p.alive ? "Survived" : "Eliminated"
                                                    }`}
                                                >
                                                    <Tag color={color}>
                                                        {p.name}
                                                        {p.alive ? " ✓" : " ✗"}
                                                    </Tag>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </SectionCard>
                            )}
                        />
                    )}
                </TabPane>

                {/* ===== TAB: Manage ===== */}
                <TabPane tab={<span><TeamOutlined /> Players & Data</span>} key="manage">
                    <SectionCard style={{ marginBottom: "1.5rem" }}>
                        <SectionTitle>Known Players</SectionTitle>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            <Input
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onPressEnter={handleAddKnownPlayer}
                                placeholder="Add a player name"
                                style={{ maxWidth: 300 }}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddKnownPlayer}
                            >
                                Add
                            </Button>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                            {data.players.length === 0 && (
                                <Text type="secondary">No players yet. Add one above or record a game.</Text>
                            )}
                            {data.players.map((name) => (
                                <Tag
                                    key={name}
                                    closable
                                    onClose={() => handleRemoveKnownPlayer(name)}
                                >
                                    {name}
                                </Tag>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <SectionTitle>Data Management</SectionTitle>
                        <Text type="secondary">
                            Your data is stored in the browser's localStorage as JSON.
                            Export to save a backup, or import to merge data from another device.
                        </Text>
                        <DataActions>
                            <Button icon={<DownloadOutlined />} onClick={handleExport}>
                                Export JSON
                            </Button>
                            <Button
                                icon={<UploadOutlined />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Import JSON
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                style={{ display: "none" }}
                                onChange={handleImport}
                            />
                        </DataActions>
                    </SectionCard>
                </TabPane>
            </Tabs>
        </Page>
    );
}

export { GameAnalysis };
