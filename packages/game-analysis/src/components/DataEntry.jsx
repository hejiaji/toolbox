import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { message } from "antd";
import { PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { DEFAULT_ROLES, FACTIONS, WINNING_FACTIONS, WINNING_FACTION_COLORS, GAME_MODES, GAME_MODE_LABELS, FACTION_LABELS, DEFAULT_ROLE_KEYS, getRoleByKey, getAllRoles, generateRoleKey } from "../constants/roles";
import { loadData, syncFromSheets, addGame, updateGame, deleteGame, addPlayer, removePlayer, addRole, removeRole, exportData, importData } from "../data/storage";
import { getOverallWinRate } from "../data/analytics";

// ============================================================================
// STYLED COMPONENTS - MD3 Design System
// ============================================================================

const SyncBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 24px;
  background: ${(props) =>
    props.status === "syncing" ? "#e8f0fe" :
    props.status === "synced" ? "#e6f4ea" :
    props.status === "error" ? "#fce8e6" : "#f1f3f4"};
  color: ${(props) =>
    props.status === "syncing" ? "#1a73e8" :
    props.status === "synced" ? "#137333" :
    props.status === "error" ? "#c5221f" : "#5f6368"};
  transition: all 0.3s ease;
`;

const SyncDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  ${(props) => props.status === "syncing" ? `
    animation: pulse 1.2s infinite;
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  ` : ""}
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PageContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
  padding: 24px;
  font-family: "Google Sans", Roboto, sans-serif;
`;

const Header = styled.div`
  max-width: 1000px;
  margin: 0 auto 32px;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px;
`;

const TabBarContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  border-bottom: 1px solid #dadce0;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${(props) => (props.active ? "#1a73e8" : "#5f6368")};
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  
  ${(props) =>
    props.active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 3px;
      background: #1a73e8;
    }
  `}
  
  &:hover {
    color: #1a73e8;
  }
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
`;

const SectionCard = styled(Card)`
  border-radius: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 500;
  color: #202124;
  margin: 0 0 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9rem;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-family: "Google Sans", Roboto, sans-serif;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9rem;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-family: "Google Sans", Roboto, sans-serif;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const Button = styled.button`
  padding: 0 24px;
  height: 40px;
  border: none;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: "Google Sans", Roboto, sans-serif;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${(props) => {
    if (props.danger) {
      return `
        background: none;
        border: none;
        color: #c5221f;
        padding: 0;
        height: auto;
        &:hover {
          background: rgba(197, 34, 31, 0.1);
        }
      `;
    }
    if (props.secondary) {
      return `
        background: white;
        border: 1px solid #dadce0;
        color: #202124;
        &:hover {
          background: #f8f9fa;
        }
      `;
    }
    // Primary
    return `
      background: #1a73e8;
      color: white;
      &:hover {
        background: #1557b0;
        box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
      }
    `;
  }}
`;

const PlayerRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 80px 40px;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 8px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PlayerName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #202124;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SwitchCheckbox = styled.input`
  width: 40px;
  height: 24px;
  cursor: pointer;
  accent-color: #1a73e8;
`;

const SwitchLabel = styled.label`
  font-size: 0.85rem;
  color: #5f6368;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #c5221f;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  transition: background 0.2s;
  border-radius: 8px;

  &:hover {
    background: rgba(197, 34, 31, 0.1);
  }
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 8px;
  padding: 6px 12px;
  margin: 4px 4px 4px 0;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ChipRemove = styled.button`
  background: none;
  border: none;
  color: #1a73e8;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;

  &:hover {
    color: #0d47a1;
  }
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const GameHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GameHistoryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const GameMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const GameDate = styled.div`
  font-size: 0.85rem;
  color: #5f6368;
`;

const GameWinner = styled.div`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  ${(props) => {
    if (props.winner === "wolf") {
      return `
        background: rgba(197, 34, 31, 0.15);
        color: #c5221f;
      `;
    } else {
      return `
        background: rgba(19, 115, 51, 0.15);
        color: #137333;
      `;
    }
  }}
`;

const GamePlayers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
`;

const PlayerChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.8rem;
`;

const PlayerChipName = styled.span`
  color: #202124;
  font-weight: 500;
`;

const PlayerChipRole = styled.span`
  color: ${(props) => props.color || "#1a73e8"};
  font-weight: 600;
  font-size: 0.75rem;
`;

const GameActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const GameDeleteButton = styled.button`
  background: none;
  border: none;
  color: #c5221f;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(197, 34, 31, 0.1);
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => props.color || "#1a73e8"};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #5f6368;
  font-weight: 500;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #5f6368;
  padding: 32px 16px;
  font-size: 0.9rem;
`;

const DatePickerInput = styled(Input)`
  width: 100%;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DataEntry = () => {
  // State
  const [data, setData] = useState(loadData());
  const [activeTab, setActiveTab] = useState("record");
  const [gameDate, setGameDate] = useState("");
  const [gameMode, setGameMode] = useState(GAME_MODES.STANDARD);
  const [gameWinner, setGameWinner] = useState(WINNING_FACTIONS.WOLF);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [gameMvps, setGameMvps] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleFaction, setNewRoleFaction] = useState(FACTIONS.VILLAGER);

  // Edit game state
  const [editingGameId, setEditingGameId] = useState(null);
  const [editWinner, setEditWinner] = useState("");
  const [editMode, setEditMode] = useState(GAME_MODES.STANDARD);
  const [editPlayers, setEditPlayers] = useState([]);
  const [editMvps, setEditMvps] = useState([]);

  const startEditGame = (game) => {
    setEditingGameId(game.id);
    setEditWinner(game.winner);
    setEditMode(game.mode || GAME_MODES.STANDARD);
    setEditPlayers(game.players.map((p) => ({ ...p })));
    setEditMvps(game.mvps || []);
  };

  const cancelEditGame = () => {
    setEditingGameId(null);
  };

  const saveEditGame = () => {
    const newData = updateGame(editingGameId, {
      winner: editWinner,
      mode: editMode,
      players: editPlayers,
      mvps: editMvps,
    });
    setData(newData);
    setEditingGameId(null);
    message.success("游戏记录已更新");
  };
  const fileInputRef = useRef(null);

  // Sync status: "idle" | "syncing" | "synced" | "error"
  const [syncStatus, setSyncStatus] = useState("idle");

  // Sync from Google Sheets on mount (if configured)
  useEffect(() => {
    setSyncStatus("syncing");
    syncFromSheets()
      .then((fresh) => { setData(fresh); setSyncStatus("synced"); })
      .catch(() => setSyncStatus("error"));
  }, []);

  // Derived data
  const games = data.games || [];
  const customRoles = data.customRoles || [];
  const allRoles = getAllRoles(customRoles);
  const overallWin = getOverallWinRate(games);

  // Functions
  const reload = () => {
    setData(loadData());
  };

  const handleAddKnownPlayer = () => {
    if (newPlayerName.trim()) {
      const newData = addPlayer(newPlayerName);
      setData(newData);
      setNewPlayerName("");
      message.success(`Added player: ${newPlayerName}`);
    }
  };

  const handleRemoveKnownPlayer = (name) => {
    const newData = removePlayer(name);
    setData(newData);
    message.success(`Removed player: ${name}`);
  };

  const addPlayerToGame = () => {
    const availablePlayers = data.players.filter(
      (p) => !gamePlayers.some((gp) => gp.name === p)
    );
    if (availablePlayers.length === 0) {
      message.warning("All known players already added");
      return;
    }
    const playerName = availablePlayers[0];
    const newPlayer = { name: playerName, role: "villager" };
    if (gameMode === GAME_MODES.DOUBLE_IDENTITY) {
      newPlayer.role2 = "villager";
    }
    setGamePlayers([...gamePlayers, newPlayer]);
  };

  const updateGamePlayer = (index, field, value) => {
    const updated = [...gamePlayers];
    updated[index] = { ...updated[index], [field]: value };
    setGamePlayers(updated);
  };

  const removeGamePlayer = (index) => {
    const removed = gamePlayers[index];
    setGamePlayers(gamePlayers.filter((_, i) => i !== index));
    if (removed) {
      setGameMvps((prev) => prev.filter((name) => name !== removed.name));
    }
  };

  const handleSubmitGame = () => {
    if (!gameDate || gamePlayers.length === 0) {
      message.error("Please select a date and add at least one player");
      return;
    }

    const gameRecord = {
      date: gameDate,
      mode: gameMode,
      winner: gameWinner,
      players: gamePlayers,
      mvps: gameMvps,
    };

    const newData = addGame(gameRecord);
    setData(newData);
    setGameDate("");
    setGameMode(GAME_MODES.STANDARD);
    setGameWinner(WINNING_FACTIONS.WOLF);
    setGamePlayers([]);
    setGameMvps([]);
    message.success("Game recorded successfully");
  };

  const handleDeleteGame = (gameId) => {
    const newData = deleteGame(gameId);
    setData(newData);
    message.success("Game deleted");
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `werewolf_games_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("Data exported");
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonStr = e.target?.result;
        const newData = importData(jsonStr);
        setData(newData);
        message.success("Data imported and merged");
      } catch (error) {
        message.error("Failed to import data");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageContainer>
      <Header>
        <HeaderRow>
          <PageTitle>🐺 Werewolf Game Tracker</PageTitle>
          {syncStatus !== "idle" && (
            <SyncBadge status={syncStatus}>
              <SyncDot status={syncStatus} />
              {syncStatus === "syncing" && "同步中..."}
              {syncStatus === "synced" && "已同步 ✓"}
              {syncStatus === "error" && "同步失败"}
            </SyncBadge>
          )}
        </HeaderRow>
        <TabBarContainer>
          <TabButton
            active={activeTab === "record"}
            onClick={() => setActiveTab("record")}
          >
            Record Game
          </TabButton>
          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          >
            History
          </TabButton>
          <TabButton
            active={activeTab === "manage"}
            onClick={() => setActiveTab("manage")}
          >
            Manage
          </TabButton>
        </TabBarContainer>
      </Header>

      <ContentContainer>
        {/* ====== RECORD TAB ====== */}
        {activeTab === "record" && (
          <>
            <SectionCard>
              <SectionTitle>游戏信息</SectionTitle>

              <FormGroup>
                <Label>日期</Label>
                <DatePickerInput
                  type="date"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>游戏模式</Label>
                <Select
                  value={gameMode}
                  onChange={(e) => {
                    const newMode = e.target.value;
                    setGameMode(newMode);
                    // Reset players when mode changes to update role fields
                    if (newMode === GAME_MODES.DOUBLE_IDENTITY) {
                      setGamePlayers(gamePlayers.map(p => ({ ...p, role2: p.role2 || "villager" })));
                    } else {
                      setGamePlayers(gamePlayers.map(({ role2, ...p }) => p));
                    }
                  }}
                >
                  <option value={GAME_MODES.STANDARD}>{GAME_MODE_LABELS[GAME_MODES.STANDARD]}</option>
                  <option value={GAME_MODES.DOUBLE_IDENTITY}>{GAME_MODE_LABELS[GAME_MODES.DOUBLE_IDENTITY]}</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>获胜阵营</Label>
                <Select
                  value={gameWinner}
                  onChange={(e) => setGameWinner(e.target.value)}
                >
                  <option value={WINNING_FACTIONS.WOLF}>🐺 狼人阵营</option>
                  <option value={WINNING_FACTIONS.VILLAGE}>🏘️ 好人阵营</option>
                </Select>
              </FormGroup>
            </SectionCard>

            <SectionCard>
              <SectionTitle>玩家</SectionTitle>

              {gamePlayers.length === 0 ? (
                <EmptyState>还没有添加玩家</EmptyState>
              ) : (
                gamePlayers.map((player, idx) => (
                  <PlayerRow key={idx}>
                    <PlayerName>{player.name}</PlayerName>
                    <Select
                      value={player.role}
                      onChange={(e) =>
                        updateGamePlayer(idx, "role", e.target.value)
                      }
                    >
                      {allRoles.map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.name}
                        </option>
                      ))}
                    </Select>
                    {gameMode === GAME_MODES.DOUBLE_IDENTITY && (
                      <Select
                        value={player.role2 || "villager"}
                        onChange={(e) =>
                          updateGamePlayer(idx, "role2", e.target.value)
                        }
                      >
                        {allRoles.map((role) => (
                          <option key={role.key} value={role.key}>
                            {role.name}
                          </option>
                        ))}
                      </Select>
                    )}
                    {(() => {
                      const r1 = getAllRoles(customRoles).find((r) => r.key === player.role);
                      const r2 = player.role2 ? getAllRoles(customRoles).find((r) => r.key === player.role2) : null;
                      const needsSide = (r1 && r1.needsSideOverride) || (r2 && r2.needsSideOverride);
                      if (!needsSide) return null;
                      return (
                        <Select
                          value={player.side || "village"}
                          onChange={(e) => updateGamePlayer(idx, "side", e.target.value)}
                          style={{ fontSize: "0.8rem", minWidth: "90px" }}
                        >
                          <option value="village">好人阵营</option>
                          <option value="wolf">狼人阵营</option>
                        </Select>
                      );
                    })()}
                    <DeleteButton onClick={() => removeGamePlayer(idx)}>
                      <DeleteOutlined />
                    </DeleteButton>
                  </PlayerRow>
                ))
              )}

              <FormGroup style={{ marginTop: "16px" }}>
                <Label>添加玩家</Label>
                <Select value="" onChange={(e) => {
                  const newPlayer = {
                    name: e.target.value,
                    role: "villager",
                  };
                  if (gameMode === GAME_MODES.DOUBLE_IDENTITY) {
                    newPlayer.role2 = "villager";
                  }
                  setGamePlayers([...gamePlayers, newPlayer]);
                }}>
                  <option value="">选择玩家...</option>
                  {data.players
                    .filter((p) => !gamePlayers.some((gp) => gp.name === p))
                    .map((player) => (
                      <option key={player} value={player}>
                        {player}
                      </option>
                    ))}
                </Select>
              </FormGroup>
            </SectionCard>

            {gamePlayers.length > 0 && (
              <SectionCard>
                <SectionTitle>🏅 MVP</SectionTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {gamePlayers.map((p) => {
                    const isMvp = gameMvps.includes(p.name);
                    return (
                      <Chip
                        key={p.name}
                        style={{
                          background: isMvp ? "#e8f0fe" : "#f1f3f4",
                          color: isMvp ? "#1a73e8" : "#5f6368",
                          cursor: "pointer",
                          fontWeight: isMvp ? 600 : 400,
                          border: isMvp ? "1.5px solid #1a73e8" : "1.5px solid transparent",
                        }}
                        onClick={() => {
                          if (isMvp) {
                            setGameMvps(gameMvps.filter((n) => n !== p.name));
                          } else {
                            setGameMvps([...gameMvps, p.name]);
                          }
                        }}
                      >
                        {isMvp && "⭐ "}{p.name}
                      </Chip>
                    );
                  })}
                </div>
                <span style={{ fontSize: "0.8rem", color: "#5f6368", marginTop: "8px", display: "block" }}>
                  点击选择本局 MVP（可多选）
                </span>
              </SectionCard>
            )}

            <ButtonGroup>
              <Button onClick={handleSubmitGame}>
                <PlusOutlined /> 保存游戏
              </Button>
            </ButtonGroup>
          </>
        )}

        {/* ====== HISTORY TAB ====== */}
        {activeTab === "history" && (
          <>
            {overallWin && (
              <StatGrid>
                <StatCard>
                  <StatValue color="#c5221f">
                    {overallWin.wolf.wins}
                  </StatValue>
                  <StatLabel>狼人胜场</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue color="#137333">
                    {overallWin.village.wins}
                  </StatValue>
                  <StatLabel>好人胜场</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue color="#c5221f">
                    {(overallWin.wolf.rate * 100).toFixed(1)}%
                  </StatValue>
                  <StatLabel>狼人胜率</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue color="#137333">
                    {(overallWin.village.rate * 100).toFixed(1)}%
                  </StatValue>
                  <StatLabel>好人胜率</StatLabel>
                </StatCard>
              </StatGrid>
            )}

            <SectionCard>
              <SectionTitle>近期游戏</SectionTitle>
              {games.length === 0 ? (
                <EmptyState>暂无游戏记录</EmptyState>
              ) : (
                <GameHistoryList>
                  {[...games]
                    .reverse()
                    .map((game) => {
                      const winnerLabel =
                        game.winner === WINNING_FACTIONS.WOLF
                          ? "🐺 狼人胜"
                          : "🏘️ 好人胜";
                      const modeLabel =
                        game.mode === GAME_MODES.DOUBLE_IDENTITY ? "双身份" : "";
                      return (
                        <GameHistoryCard key={game.id}>
                          {editingGameId === game.id ? (
                            /* ---- EDIT MODE ---- */
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                <GameDate>{game.date}</GameDate>
                                <Select value={editWinner} onChange={(e) => setEditWinner(e.target.value)} style={{ fontSize: "0.85rem", padding: "4px 8px", borderRadius: "8px" }}>
                                  <option value={WINNING_FACTIONS.WOLF}>🐺 狼人胜</option>
                                  <option value={WINNING_FACTIONS.VILLAGE}>🏘️ 好人胜</option>
                                </Select>
                                <Select value={editMode} onChange={(e) => setEditMode(e.target.value)} style={{ fontSize: "0.85rem", padding: "4px 8px", borderRadius: "8px" }}>
                                  <option value={GAME_MODES.STANDARD}>标准</option>
                                  <option value={GAME_MODES.DOUBLE_IDENTITY}>双身份</option>
                                </Select>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {editPlayers.map((p, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center", background: "#f8f9fa", borderRadius: "8px", padding: "6px 10px" }}>
                                    <span style={{ fontWeight: 500, minWidth: "60px", fontSize: "0.85rem" }}>{p.name}</span>
                                    <Select
                                      value={p.role}
                                      onChange={(e) => {
                                        const copy = [...editPlayers];
                                        copy[idx] = { ...copy[idx], role: e.target.value };
                                        setEditPlayers(copy);
                                      }}
                                      style={{ fontSize: "0.8rem", padding: "2px 6px", borderRadius: "6px", flex: 1 }}
                                    >
                                      {allRoles.map((r) => (
                                        <option key={r.key} value={r.key}>{r.name}</option>
                                      ))}
                                    </Select>
                                    {editMode === GAME_MODES.DOUBLE_IDENTITY && (
                                      <Select
                                        value={p.role2 || "villager"}
                                        onChange={(e) => {
                                          const copy = [...editPlayers];
                                          copy[idx] = { ...copy[idx], role2: e.target.value };
                                          setEditPlayers(copy);
                                        }}
                                        style={{ fontSize: "0.8rem", padding: "2px 6px", borderRadius: "6px", flex: 1 }}
                                      >
                                        {allRoles.map((r) => (
                                          <option key={r.key} value={r.key}>{r.name}</option>
                                        ))}
                                      </Select>
                                    )}
                                    <Select
                                      value={p.side || ""}
                                      onChange={(e) => {
                                        const copy = [...editPlayers];
                                        copy[idx] = { ...copy[idx], side: e.target.value || undefined };
                                        setEditPlayers(copy);
                                      }}
                                      style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: "6px", minWidth: "80px" }}
                                    >
                                      <option value="">自动</option>
                                      <option value="village">好人</option>
                                      <option value="wolf">狼人</option>
                                    </Select>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <Label style={{ fontSize: "0.8rem", marginBottom: "4px" }}>🏅 MVP</Label>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  {editPlayers.map((p) => {
                                    const isMvp = editMvps.includes(p.name);
                                    return (
                                      <Chip
                                        key={p.name}
                                        style={{
                                          background: isMvp ? "#fef3c7" : "#f1f3f4",
                                          color: isMvp ? "#b45309" : "#5f6368",
                                          cursor: "pointer",
                                          fontWeight: isMvp ? 600 : 400,
                                          fontSize: "0.8rem",
                                        }}
                                        onClick={() => {
                                          if (isMvp) {
                                            setEditMvps(editMvps.filter((n) => n !== p.name));
                                          } else {
                                            setEditMvps([...editMvps, p.name]);
                                          }
                                        }}
                                      >
                                        {isMvp && "⭐ "}{p.name}
                                      </Chip>
                                    );
                                  })}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <Button onClick={saveEditGame} style={{ background: "#1a73e8", color: "#fff" }}>
                                  <CheckOutlined /> 保存
                                </Button>
                                <Button onClick={cancelEditGame} style={{ background: "#f1f3f4", color: "#5f6368" }}>
                                  <CloseOutlined /> 取消
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* ---- VIEW MODE ---- */
                            <>
                              <GameMeta>
                                <GameDate>{game.date}</GameDate>
                                <GameWinner winner={game.winner}>
                                  {winnerLabel}
                                </GameWinner>
                                {modeLabel && (
                                  <span style={{
                                    color: "#1a73e8",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    background: "#e8f0fe",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                  }}>
                                    {modeLabel}
                                  </span>
                                )}
                                <span style={{ color: "#5f6368", fontSize: "0.85rem" }}>
                                  {game.players.length} 人
                                </span>
                                {game.mvps && game.mvps.length > 0 && (
                                  <span style={{
                                    color: "#b45309",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    background: "#fef3c7",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                  }}>
                                    🏅 MVP: {game.mvps.join(", ")}
                                  </span>
                                )}
                              </GameMeta>
                              <GamePlayers>
                                {game.players.map((p, idx) => {
                                  const role = getRoleByKey(p.role, customRoles);
                                  const roleColor = role
                                    ? (() => {
                                        if (role.faction === FACTIONS.WOLF)
                                          return "#c5221f";
                                        if (role.faction === FACTIONS.VILLAGER)
                                          return "#137333";
                                        return "#1a73e8";
                                      })()
                                    : "#5f6368";
                                  const role2 = p.role2 ? getRoleByKey(p.role2, customRoles) : null;
                                  const role2Color = role2
                                    ? (() => {
                                        if (role2.faction === FACTIONS.WOLF) return "#c5221f";
                                        if (role2.faction === FACTIONS.VILLAGER) return "#137333";
                                        return "#1a73e8";
                                      })()
                                    : null;
                                  return (
                                    <PlayerChip key={idx}>
                                      <PlayerChipName>{p.name}</PlayerChipName>
                                      <PlayerChipRole color={roleColor}>
                                        {role?.name}
                                      </PlayerChipRole>
                                      {role2 && (
                                        <PlayerChipRole color={role2Color}>
                                          {role2.name}
                                        </PlayerChipRole>
                                      )}
                                    </PlayerChip>
                                  );
                                })}
                              </GamePlayers>
                              <GameActionsContainer>
                                <GameDeleteButton
                                  onClick={() => startEditGame(game)}
                                  style={{ color: "#1a73e8" }}
                                >
                                  <EditOutlined />
                                </GameDeleteButton>
                                <GameDeleteButton
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "确认删除此局游戏记录？"
                                      )
                                    ) {
                                      handleDeleteGame(game.id);
                                    }
                                  }}
                                >
                                  <DeleteOutlined />
                                </GameDeleteButton>
                              </GameActionsContainer>
                            </>
                          )}
                        </GameHistoryCard>
                      );
                    })}
                </GameHistoryList>
              )}
            </SectionCard>
          </>
        )}

        {/* ====== MANAGE TAB ====== */}
        {activeTab === "manage" && (
          <>
            <SectionCard>
              <SectionTitle>已知玩家</SectionTitle>

              <FormGroup>
                <Label>添加玩家</Label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Input
                    type="text"
                    placeholder="玩家名称..."
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddKnownPlayer();
                      }
                    }}
                  />
                  <Button onClick={handleAddKnownPlayer}>
                    <PlusOutlined />
                  </Button>
                </div>
              </FormGroup>

              {data.players.length === 0 ? (
                <EmptyState>暂无玩家</EmptyState>
              ) : (
                <ChipsContainer>
                  {data.players.map((player) => (
                    <Chip key={player}>
                      <span>{player}</span>
                      <ChipRemove onClick={() => handleRemoveKnownPlayer(player)}>
                        ✕
                      </ChipRemove>
                    </Chip>
                  ))}
                </ChipsContainer>
              )}
            </SectionCard>

            <SectionCard>
              <SectionTitle>角色管理</SectionTitle>

              <FormGroup>
                <Label>添加自定义角色</Label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Input
                    type="text"
                    placeholder="角色名称..."
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    style={{ flex: "1 1 140px" }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const trimmed = newRoleName.trim();
                        if (!trimmed) return;
                        const key = generateRoleKey(trimmed);
                        const newData = addRole({ key, name: trimmed, faction: newRoleFaction });
                        setData(newData);
                        setNewRoleName("");
                        message.success(`已添加角色: ${trimmed}`);
                      }
                    }}
                  />
                  <Select
                    value={newRoleFaction}
                    onChange={(e) => setNewRoleFaction(e.target.value)}
                    style={{ flex: "0 0 140px" }}
                  >
                    <option value={FACTIONS.WOLF}>{FACTION_LABELS[FACTIONS.WOLF]}</option>
                    <option value={FACTIONS.VILLAGER}>{FACTION_LABELS[FACTIONS.VILLAGER]}</option>
                    <option value={FACTIONS.GOD}>{FACTION_LABELS[FACTIONS.GOD]}</option>
                  </Select>
                  <Button onClick={() => {
                    const trimmed = newRoleName.trim();
                    if (!trimmed) return;
                    const key = generateRoleKey(trimmed);
                    const newData = addRole({ key, name: trimmed, faction: newRoleFaction });
                    setData(newData);
                    setNewRoleName("");
                    message.success(`已添加角色: ${trimmed}`);
                  }}>
                    <PlusOutlined />
                  </Button>
                </div>
              </FormGroup>

              <Label style={{ marginTop: "12px", marginBottom: "8px" }}>默认角色</Label>
              <ChipsContainer>
                {DEFAULT_ROLES.map((role) => {
                  const color = role.faction === FACTIONS.WOLF ? "#c5221f"
                    : role.faction === FACTIONS.GOD ? "#1a73e8" : "#137333";
                  const bg = role.faction === FACTIONS.WOLF ? "#fce8e6"
                    : role.faction === FACTIONS.GOD ? "#e8f0fe" : "#e6f4ea";
                  return (
                    <Chip key={role.key} style={{ background: bg, color }}>
                      <span>{role.name}</span>
                    </Chip>
                  );
                })}
              </ChipsContainer>

              {customRoles.length > 0 && (
                <>
                  <Label style={{ marginTop: "16px", marginBottom: "8px" }}>自定义角色</Label>
                  <ChipsContainer>
                    {customRoles.map((role) => {
                      const color = role.faction === FACTIONS.WOLF ? "#c5221f"
                        : role.faction === FACTIONS.GOD ? "#1a73e8" : "#137333";
                      const bg = role.faction === FACTIONS.WOLF ? "#fce8e6"
                        : role.faction === FACTIONS.GOD ? "#e8f0fe" : "#e6f4ea";
                      return (
                        <Chip key={role.key} style={{ background: bg, color }}>
                          <span>{role.name}</span>
                          <ChipRemove onClick={() => {
                            const newData = removeRole(role.key);
                            setData(newData);
                            message.success(`已删除角色: ${role.name}`);
                          }}>
                            ✕
                          </ChipRemove>
                        </Chip>
                      );
                    })}
                  </ChipsContainer>
                </>
              )}
            </SectionCard>

            <SectionCard>
              <SectionTitle>数据管理</SectionTitle>

              <ButtonGroup>
                <Button onClick={handleExport}>
                  <DownloadOutlined /> 导出数据
                </Button>
                <Button secondary onClick={() => fileInputRef.current?.click()}>
                  <UploadOutlined /> 导入数据
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
              </ButtonGroup>
            </SectionCard>
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default DataEntry;
