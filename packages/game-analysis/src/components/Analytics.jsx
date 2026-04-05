import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  FACTION_COLORS,
  FACTIONS,
  WINNING_FACTIONS,
  WINNING_FACTION_LABELS,
  WINNING_FACTION_COLORS,
  GAME_MODES,
  getRoleByKey,
  getAllRoles,
} from '../constants/roles';
import { loadData, syncFromSheets } from '../data/storage';
import {
  getOverallWinRate,
  getPlayerStats,
  getRoleStats,
  getGameHistory,
  getAvailableYears,
  filterGamesByYear,
  getPlayerDetailedStats,
} from '../data/analytics';
import PieChart from './PieChart';
import BarChart from './BarChart';

// MD3 Color Palette
const MD3_COLORS = {
  primary: '#1a73e8',
  surface: '#f8f9fa',
  onSurface: '#202124',
  secondary: '#5f6368',
  wolf: '#c5221f',
  village: '#137333',
  god: '#1a73e8',
  white: '#ffffff',
};

// Styled Components
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

const Container = styled.div`
  background-color: ${MD3_COLORS.surface};
  min-height: 100vh;
  padding: 24px;
  font-family: 'Google Sans', Roboto, sans-serif;
  color: ${MD3_COLORS.onSurface};
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${MD3_COLORS.onSurface};
  margin: 0 0 16px 0;
`;

const TabBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding: 0;
`;

const TabButton = styled.button`
  padding: 8px 20px;
  border: none;
  border-radius: 24px;
  background-color: transparent;
  color: ${(props) => (props.active ? MD3_COLORS.primary : MD3_COLORS.secondary)};
  font-weight: ${(props) => (props.active ? '600' : '500')};
  font-size: 0.9rem;
  cursor: pointer;
  font-family: 'Google Sans', Roboto, sans-serif;
  transition: all 0.2s ease;

  ${(props) =>
    props.active &&
    `
    background-color: #e8f0fe;
    color: ${MD3_COLORS.primary};
  `}

  &:hover {
    background-color: ${(props) =>
      props.active ? '#e8f0fe' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  background-color: ${MD3_COLORS.white};
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
  color: ${MD3_COLORS.secondary};
  margin: 0;
`;

const SectionCard = styled.div`
  background-color: ${MD3_COLORS.white};
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 500;
  color: ${MD3_COLORS.onSurface};
  margin: 0 0 24px 0;
  padding-left: 16px;
  border-left: 4px solid ${MD3_COLORS.primary};
  display: flex;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: ${MD3_COLORS.white};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${MD3_COLORS.secondary};
  margin-bottom: 8px;
  font-weight: 400;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.color || MD3_COLORS.primary};
`;

const ChartContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ChartWrapper = styled.div`
  flex: ${(props) => props.flex || '0 0 300px'};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  thead {
    background-color: ${MD3_COLORS.surface};
  }

  th {
    padding: 12px 8px;
    text-align: left;
    font-weight: 500;
    color: ${MD3_COLORS.onSurface};
    border-bottom: 1px solid #e8eaed;
  }

  td {
    padding: 12px 8px;
    border-bottom: 1px solid #e8eaed;
    color: ${MD3_COLORS.onSurface};
  }

  tbody tr {
    &:nth-child(even) {
      background-color: #fafbfc;
    }

    &:hover {
      background-color: #f1f3f4;
    }
  }
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${(props) => props.bgColor || MD3_COLORS.surface};
  color: ${(props) => props.color || MD3_COLORS.onSurface};
`;

const RoleChip = styled(Chip)`
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.color};
  font-size: 0.8rem;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const WinRateTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${(props) => {
    if (props.rate >= 0.5) return '#e6f4ea';
    if (props.rate >= 0.3) return '#fef7e0';
    return '#fce8e6';
  }};
  color: ${(props) => {
    if (props.rate >= 0.5) return '#137333';
    if (props.rate >= 0.3) return '#ea8600';
    return '#c5221f';
  }};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryCard = styled.div`
  background-color: ${MD3_COLORS.white};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 16px;
  align-items: center;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const DateLabel = styled.div`
  font-size: 0.85rem;
  color: ${MD3_COLORS.secondary};
  font-weight: 500;
`;

const HistoryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryWinner = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const HistoryPlayers = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
`;

const PlayerChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.color};
  font-weight: 500;

  &[title] {
    cursor: help;
  }
`;

const PlayerCount = styled.div`
  font-size: 0.85rem;
  color: ${MD3_COLORS.secondary};
  font-weight: 500;
`;

// Helper: Get faction color for role
const getFactionColor = (faction) => {
  if (faction === FACTIONS.WOLF) return MD3_COLORS.wolf;
  if (faction === FACTIONS.GOD) return MD3_COLORS.god;
  return MD3_COLORS.village;
};

// Helper: Get light background color for chips
const getFactionBgColor = (faction) => {
  if (faction === FACTIONS.WOLF) return '#fce8e6';
  if (faction === FACTIONS.GOD) return '#e8f0fe';
  return '#e6f4ea';
};

// Helper: Get faction label
const factionLabel = (faction) => {
  if (faction === FACTIONS.WOLF) return '狼人';
  if (faction === FACTIONS.GOD) return '神职';
  return '村民';
};

export const Analytics = () => {
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState('analytics');

  const reload = useCallback(() => {
    setData(loadData());
  }, []);

  // Sync status: "idle" | "syncing" | "synced" | "error"
  const [syncStatus, setSyncStatus] = useState("idle");
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [playerSortKey, setPlayerSortKey] = useState("gamesPlayed");
  const [playerSortAsc, setPlayerSortAsc] = useState(false);

  // Sync from Google Sheets on mount (if configured)
  useEffect(() => {
    setSyncStatus("syncing");
    syncFromSheets()
      .then((fresh) => { setData(fresh); setSyncStatus("synced"); })
      .catch(() => setSyncStatus("error"));
  }, []);

  // Derive stats
  const allGames = useMemo(() => data.games || [], [data]);
  const customRoles = useMemo(() => data.customRoles || [], [data]);
  const availableYears = useMemo(() => getAvailableYears(allGames), [allGames]);
  const games = useMemo(() => filterGamesByYear(allGames, selectedYear), [allGames, selectedYear]);
  const overallWin = useMemo(() => getOverallWinRate(games), [games]);
  const playerStats = useMemo(() => getPlayerStats(games), [games]);
  const roleStats = useMemo(() => getRoleStats(games), [games]);
  const history = useMemo(() => getGameHistory(games), [games]);
  const playerDetail = useMemo(
    () => expandedPlayer ? getPlayerDetailedStats(games, expandedPlayer) : null,
    [games, expandedPlayer]
  );

  const sortedPlayerStats = useMemo(() => {
    return [...playerStats].sort((a, b) => {
      const va = a[playerSortKey], vb = b[playerSortKey];
      if (typeof va === "string") return playerSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return playerSortAsc ? va - vb : vb - va;
    });
  }, [playerStats, playerSortKey, playerSortAsc]);

  const handlePlayerSort = (key) => {
    if (playerSortKey === key) setPlayerSortAsc(!playerSortAsc);
    else { setPlayerSortKey(key); setPlayerSortAsc(false); }
  };

  const sortArrow = (key) => {
    const isActive = playerSortKey === key;
    return (
      <span style={{ color: isActive ? "#1a73e8" : "#dadce0", fontSize: "0.7rem", marginLeft: "2px" }}>
        {isActive ? (playerSortAsc ? "▲" : "▼") : "⇅"}
      </span>
    );
  };

  const isEmpty = games.length === 0;

  // Render empty state
  if (isEmpty) {
    return (
      <Container>
        <Header>
          <HeaderRow>
            <Title>游戏数据分析</Title>
            {syncStatus !== "idle" && (
              <SyncBadge status={syncStatus}>
                <SyncDot status={syncStatus} />
                {syncStatus === "syncing" && "同步中..."}
                {syncStatus === "synced" && "已同步 ✓"}
                {syncStatus === "error" && "同步失败"}
              </SyncBadge>
            )}
          </HeaderRow>
        </Header>
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <EmptyText>暂无游戏数据</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderRow>
          <Title>游戏数据分析</Title>
          {syncStatus !== "idle" && (
            <SyncBadge status={syncStatus}>
              <SyncDot status={syncStatus} />
              {syncStatus === "syncing" && "同步中..."}
              {syncStatus === "synced" && "已同步 ✓"}
              {syncStatus === "error" && "同步失败"}
            </SyncBadge>
          )}
        </HeaderRow>
        <TabBar>
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            数据分析
          </TabButton>
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            游戏历史
          </TabButton>
        </TabBar>
      </Header>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          {/* Overall Win Rate */}
          <SectionCard>
            <SectionTitle>总体胜负分布</SectionTitle>
            {overallWin && (
              <ChartContainer>
                <ChartWrapper flex="0 0 300px">
                  <PieChart data={[
                    { label: WINNING_FACTION_LABELS[WINNING_FACTIONS.WOLF], value: overallWin.wolf.wins, color: WINNING_FACTION_COLORS[WINNING_FACTIONS.WOLF] },
                    { label: WINNING_FACTION_LABELS[WINNING_FACTIONS.VILLAGE], value: overallWin.village.wins, color: WINNING_FACTION_COLORS[WINNING_FACTIONS.VILLAGE] },
                  ]} />
                </ChartWrapper>
                <StatsGrid style={{ flex: 1 }}>
                  <StatCard>
                    <StatLabel>狼人阵营胜场</StatLabel>
                    <StatValue color={MD3_COLORS.wolf}>
                      {overallWin.wolf.wins}
                    </StatValue>
                    <StatLabel>共 {overallWin.wolf.total} 局</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatLabel>好人阵营胜场</StatLabel>
                    <StatValue color={MD3_COLORS.village}>
                      {overallWin.village.wins}
                    </StatValue>
                    <StatLabel>共 {overallWin.village.total} 局</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatLabel>狼人阵营胜率</StatLabel>
                    <StatValue color={MD3_COLORS.wolf}>
                      {(overallWin.wolf.rate * 100).toFixed(1)}%
                    </StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>好人阵营胜率</StatLabel>
                    <StatValue color={MD3_COLORS.village}>
                      {(overallWin.village.rate * 100).toFixed(1)}%
                    </StatValue>
                  </StatCard>
                </StatsGrid>
              </ChartContainer>
            )}
          </SectionCard>

          {/* Role Win Rate */}
          <SectionCard>
            <SectionTitle>角色胜率</SectionTitle>
            {roleStats.length > 0 && (
              <ChartContainer>
                <ChartWrapper flex="0 0 300px">
                  <BarChart data={roleStats.map((r) => {
                    const roleObj = getRoleByKey(r.roleKey, customRoles);
                    const faction = roleObj?.faction || FACTIONS.VILLAGER;
                    return {
                      label: roleObj?.name || r.roleKey,
                      value: r.winRate,
                      maxValue: 1,
                      color: FACTION_COLORS[faction],
                    };
                  })} />
                </ChartWrapper>
                <div style={{ flex: 1 }}>
                  <TableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <th>角色</th>
                          <th>出场次数</th>
                          <th>胜场</th>
                          <th>胜率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleStats.map((role) => {
                          const roleObj = getRoleByKey(role.roleKey, customRoles);
                          const faction = roleObj?.faction || FACTIONS.VILLAGER;
                          const factionColor = getFactionColor(faction);
                          const factionBgColor = getFactionBgColor(faction);

                          return (
                            <tr key={role.roleKey}>
                              <td>
                                <RoleChip
                                  bgColor={factionBgColor}
                                  color={factionColor}
                                >
                                  {roleObj?.name || role.roleKey}
                                </RoleChip>
                              </td>
                              <td>{role.timesPlayed}</td>
                              <td>{role.wins}</td>
                              <td>
                                <WinRateTag rate={role.winRate}>
                                  {(role.winRate * 100).toFixed(1)}%
                                </WinRateTag>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableContainer>
                </div>
              </ChartContainer>
            )}
          </SectionCard>

          {/* Player Performance */}
          <SectionCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              <SectionTitle style={{ marginBottom: 0 }}>玩家表现</SectionTitle>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <Chip
                  bgColor={selectedYear === "all" ? "#e8f0fe" : "#f1f3f4"}
                  color={selectedYear === "all" ? "#1a73e8" : "#5f6368"}
                  style={{ cursor: "pointer", fontWeight: selectedYear === "all" ? 600 : 400 }}
                  onClick={() => setSelectedYear("all")}
                >
                  总体
                </Chip>
                {availableYears.map((yr) => (
                  <Chip
                    key={yr}
                    bgColor={selectedYear === yr ? "#e8f0fe" : "#f1f3f4"}
                    color={selectedYear === yr ? "#1a73e8" : "#5f6368"}
                    style={{ cursor: "pointer", fontWeight: selectedYear === yr ? 600 : 400 }}
                    onClick={() => setSelectedYear(yr)}
                  >
                    {yr}
                  </Chip>
                ))}
              </div>
            </div>
            {playerStats.length > 0 && (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("name")}>玩家{sortArrow("name")}</th>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("gamesPlayed")}>总局数{sortArrow("gamesPlayed")}</th>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("wins")}>胜场{sortArrow("wins")}</th>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("losses")}>败场{sortArrow("losses")}</th>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("winRate")}>胜率{sortArrow("winRate")}</th>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("mvpCount")}>MVP{sortArrow("mvpCount")}</th>
                      <th style={{cursor:"pointer",userSelect:"none"}} onClick={()=>handlePlayerSort("scapegoatCount")}>背锅侠{sortArrow("scapegoatCount")}</th>
                      <th>出场角色</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayerStats.map((stat) => {
                      const isExpanded = expandedPlayer === stat.name;
                      const detail = isExpanded ? getPlayerDetailedStats(games, stat.name) : null;
                      return [
                      <tr
                        key={stat.name}
                        style={{ cursor: "pointer" }}
                        onClick={() => setExpandedPlayer(isExpanded ? null : stat.name)}
                      >
                        <td>
                          <strong style={{ color: "#1a73e8" }}>{stat.name}</strong>
                          <span style={{ color: "#9aa0a6", fontSize: "0.7rem", marginLeft: "4px" }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </td>
                        <td>{stat.gamesPlayed}</td>
                        <td>{stat.wins}</td>
                        <td>{stat.losses}</td>
                        <td>
                          <WinRateTag rate={stat.winRate}>
                            {(stat.winRate * 100).toFixed(1)}%
                          </WinRateTag>
                        </td>
                        <td>
                          {stat.mvpCount > 0 ? `🏅 ${stat.mvpCount}` : "-"}
                        </td>
                        <td>
                          {stat.scapegoatCount > 0 ? `💀 ${stat.scapegoatCount}` : "-"}
                        </td>
                        <td>
                          <TagContainer>
                            {Object.entries(stat.roles)
                              .sort((a, b) => b[1] - a[1])
                              .map(([roleKey, count]) => {
                                const roleObj = getRoleByKey(roleKey, customRoles);
                                const faction =
                                  roleObj?.faction || FACTIONS.VILLAGER;
                                const factionColor = getFactionColor(faction);
                                const factionBgColor =
                                  getFactionBgColor(faction);

                                return (
                                  <RoleChip
                                    key={roleKey}
                                    bgColor={factionBgColor}
                                    color={factionColor}
                                    title={`${roleObj?.name || roleKey} 出场 ${count} 次`}
                                  >
                                    {roleObj?.name || roleKey}{' '}
                                    <span>×{count}</span>
                                  </RoleChip>
                                );
                              })}
                          </TagContainer>
                        </td>
                      </tr>,
                      isExpanded && detail && (
                        <tr key={`${stat.name}_detail`}>
                          <td colSpan={8} style={{ padding: 0, border: "none" }}>
                            <div style={{
                              background: "#f8f9fa",
                              borderRadius: "12px",
                              padding: "16px 20px",
                              margin: "4px 0 12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "16px",
                            }}>
                              {/* Stats overview */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
                                <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontSize: "0.75rem", color: "#5f6368" }}>狼人阵营胜率</div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#c5221f" }}>
                                    {detail.wolfSideGames > 0 ? `${(detail.wolfSideWinRate * 100).toFixed(0)}%` : "-"}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#9aa0a6" }}>{detail.wolfSideWins}/{detail.wolfSideGames} 局</div>
                                </div>
                                <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontSize: "0.75rem", color: "#5f6368" }}>好人阵营胜率</div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#137333" }}>
                                    {detail.villageSideGames > 0 ? `${(detail.villageSideWinRate * 100).toFixed(0)}%` : "-"}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#9aa0a6" }}>{detail.villageSideWins}/{detail.villageSideGames} 局</div>
                                </div>
                                <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontSize: "0.75rem", color: "#5f6368" }}>MVP 率</div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#b45309" }}>
                                    {detail.gamesPlayed > 0 ? `${(detail.mvpRate * 100).toFixed(0)}%` : "-"}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#9aa0a6" }}>🏅 {detail.mvpCount} 次</div>
                                </div>
                                <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontSize: "0.75rem", color: "#5f6368" }}>最佳连胜</div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a73e8" }}>
                                    {detail.streak.best} 局
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#9aa0a6" }}>当前 {detail.streak.current} 连胜</div>
                                </div>
                                <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontSize: "0.75rem", color: "#5f6368" }}>标准模式胜率</div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5f6368" }}>
                                    {detail.standardGames > 0 ? `${(detail.standardWinRate * 100).toFixed(0)}%` : "-"}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#9aa0a6" }}>{detail.standardWins}/{detail.standardGames} 局</div>
                                </div>
                                <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontSize: "0.75rem", color: "#5f6368" }}>双身份模式胜率</div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a73e8" }}>
                                    {detail.doubleIdGames > 0 ? `${(detail.doubleIdWinRate * 100).toFixed(0)}%` : "-"}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#9aa0a6" }}>{detail.doubleIdWins}/{detail.doubleIdGames} 局</div>
                                </div>
                              </div>

                              {/* Recent form */}
                              {detail.recentForm.length > 0 && (
                                <div>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#5f6368", marginBottom: "6px" }}>近 {detail.recentForm.length} 场</div>
                                  <div style={{ display: "flex", gap: "4px" }}>
                                    {detail.recentForm.map((r, i) => (
                                      <span key={i} style={{
                                        width: "24px", height: "24px", borderRadius: "6px",
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.7rem", fontWeight: 600,
                                        background: r === "W" ? "#e6f4ea" : "#fce8e6",
                                        color: r === "W" ? "#137333" : "#c5221f",
                                      }}>{r === "W" ? "胜" : "负"}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Role win rates */}
                              {detail.roleWinRates.length > 0 && (
                                <div>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#5f6368", marginBottom: "6px" }}>各角色胜率</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {detail.roleWinRates.map((r) => {
                                      const roleObj = getRoleByKey(r.roleKey, customRoles);
                                      const faction = roleObj?.faction || FACTIONS.VILLAGER;
                                      return (
                                        <div key={r.roleKey} style={{
                                          display: "flex", alignItems: "center", gap: "8px",
                                          background: "white", borderRadius: "8px", padding: "6px 12px",
                                        }}>
                                          <Chip bgColor={getFactionBgColor(faction)} color={getFactionColor(faction)} style={{ fontSize: "0.75rem" }}>
                                            {roleObj?.name || r.roleKey}
                                          </Chip>
                                          <div style={{ flex: 1, background: "#e8eaed", borderRadius: "4px", height: "6px" }}>
                                            <div style={{
                                              width: `${(r.winRate * 100).toFixed(0)}%`,
                                              background: r.winRate >= 0.5 ? "#137333" : r.winRate >= 0.3 ? "#ea8600" : "#c5221f",
                                              height: "100%", borderRadius: "4px",
                                            }} />
                                          </div>
                                          <span style={{ fontSize: "0.75rem", color: "#5f6368", minWidth: "65px", textAlign: "right" }}>
                                            {(r.winRate * 100).toFixed(0)}% ({r.wins}/{r.played})
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Top partners */}
                              {detail.partners.length > 0 && (
                                <div>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#5f6368", marginBottom: "6px" }}>常见队友</div>
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {detail.partners.slice(0, 6).map((p) => (
                                      <Chip key={p.name} bgColor="#f1f3f4" color="#5f6368" style={{ fontSize: "0.75rem" }}>
                                        {p.name} <span style={{ color: "#9aa0a6" }}>({p.gamesPlayed}局 {(p.winRate * 100).toFixed(0)}%胜)</span>
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                      ];
                    })}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <SectionCard>
          <SectionTitle>游戏历史</SectionTitle>
          {history.length > 0 && (
            <HistoryList>
              {history.map((game) => {
                const winnerFaction =
                  game.winner === WINNING_FACTIONS.WOLF
                    ? FACTIONS.WOLF
                    : FACTIONS.VILLAGER;
                const winnerColor = getFactionColor(winnerFaction);
                const winnerBgColor = getFactionBgColor(winnerFaction);
                const winnerLabel =
                  game.winner === WINNING_FACTIONS.WOLF
                    ? '狼人阵营'
                    : '好人阵营';

                const isDoubleIdentity = game.mode === GAME_MODES.DOUBLE_IDENTITY;

                const isExpanded = expandedGameId === game.id;

                return (
                  <HistoryCard
                    key={game.id}
                    onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <DateLabel>{game.date}</DateLabel>
                    <HistoryContent>
                      <HistoryWinner>
                        <Chip bgColor={winnerBgColor} color={winnerColor}>
                          🏆 {winnerLabel}
                        </Chip>
                        <Chip bgColor={isDoubleIdentity ? "#e8f0fe" : "#f1f3f4"} color={isDoubleIdentity ? "#1a73e8" : "#5f6368"}>
                          {isDoubleIdentity ? "双身份" : "标准"}
                        </Chip>
                        <span style={{ color: "#5f6368", fontSize: "0.8rem" }}>
                          {game.players.length} 人
                        </span>
                        {game.mvps && game.mvps.length > 0 && (
                          <Chip bgColor="#fef3c7" color="#b45309">
                            🏅 {game.mvps.join(", ")}
                          </Chip>
                        )}
                        {game.scapegoats && game.scapegoats.length > 0 && (
                          <Chip bgColor="#fce8e6" color="#c5221f">
                            💀 {game.scapegoats.join(", ")}
                          </Chip>
                        )}
                        <span style={{ color: "#9aa0a6", fontSize: "0.75rem", marginLeft: "auto" }}>
                          {isExpanded ? "▲ 收起" : "▼ 详情"}
                        </span>
                      </HistoryWinner>
                    </HistoryContent>
                    {isExpanded && (
                      <div style={{ marginTop: "12px", borderTop: "1px solid #e8eaed", paddingTop: "12px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                          {game.players.map((player, idx) => {
                            const roleObj = getRoleByKey(player.role, customRoles);
                            const role2Obj = player.role2 ? getRoleByKey(player.role2, customRoles) : null;
                            const faction = roleObj?.faction || FACTIONS.VILLAGER;
                            const roleColor = getFactionColor(faction);
                            const roleBgColor = getFactionBgColor(faction);
                            const isMvp = game.mvps && game.mvps.includes(player.name);
                            const sideOverride = player.side;

                            return (
                              <div key={idx} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "#f8f9fa",
                                borderRadius: "10px",
                                padding: "8px 12px",
                              }}>
                                <span style={{ fontWeight: 500, fontSize: "0.9rem", color: "#202124" }}>
                                  {isMvp && "⭐ "}{player.name}
                                </span>
                                <Chip bgColor={roleBgColor} color={roleColor} style={{ fontSize: "0.75rem" }}>
                                  {roleObj?.name || player.role}
                                </Chip>
                                {role2Obj && (
                                  <Chip
                                    bgColor={getFactionBgColor(role2Obj.faction)}
                                    color={getFactionColor(role2Obj.faction)}
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {role2Obj.name}
                                  </Chip>
                                )}
                                {sideOverride && (
                                  <Chip
                                    bgColor={sideOverride === "wolf" ? "#fce8e6" : "#e6f4ea"}
                                    color={sideOverride === "wolf" ? "#c5221f" : "#137333"}
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    {sideOverride === "wolf" ? "狼阵营" : "好人阵营"}
                                  </Chip>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </HistoryCard>
                );
              })}
            </HistoryList>
          )}
        </SectionCard>
      )}
    </Container>
  );
};
