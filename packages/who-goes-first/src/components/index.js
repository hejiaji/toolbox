import React, { useState } from "react";
import styled from "styled-components";
import {
    Typography,
    Input,
    Button,
    List,
    Progress,
    Card,
    Tag,
    Empty,
} from "antd";

const { Title } = Typography;

const Page = styled.div`
    max-width: 980px;
    margin: 0 auto;
    padding: 1.75rem 1.5rem 2.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
`;

const Hero = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const HeroTitle = styled(Title)`
    && {
        margin: 0;
    }
`;

const HeroSubtitle = styled.p`
    margin: 0;
    max-width: 42rem;
    color: var(--chrome-muted);
    font-size: 1rem;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.75fr);
    gap: 1.5rem;
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const SectionCard = styled(Card)`
    && {
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 600;
`;

const InputRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
`;

const InputGrow = styled.div`
    flex: 1;
    min-width: 220px;
`;

const ActionRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const HelperText = styled.div`
    margin-top: 0.5rem;
    color: var(--chrome-muted);
    font-size: 0.9rem;
`;

const PlayerRow = styled(List.Item)`
    padding: 0.75rem;
    border-radius: 12px;
    margin-bottom: 0.6rem;
    border: 1px solid rgba(15, 23, 42, 0.06);
    background: ${({ $highlight }) =>
        $highlight ? "rgba(26, 92, 255, 0.08)" : "var(--chrome-surface)"};
`;

const PlayerRowContent = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
`;

const PlayerName = styled.div`
    font-weight: 600;
`;

const PlayerProgress = styled.div`
    flex: 1;
    min-width: 120px;
`;

const PlayerActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ResultBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const ResultLabel = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--chrome-muted);
`;

const ResultName = styled.div`
    font-size: 2rem;
    font-weight: 700;
`;

const ResultOrder = styled.div`
    color: var(--chrome-muted);
`;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const parsePlayersInput = (value) => {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

function WhoGoesFirst() {
    const [players, setPlayers] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [playersMap, setPlayersMap] = useState({});

    const handlePlayersAdd = () => {
        const newPlayers = parsePlayersInput(inputValue);
        if (!newPlayers.length) {
            return;
        }
        const allPlayers = [...players, ...newPlayers];
        setPlayers([...new Set(allPlayers)]);
        setInputValue("");
        setPlayersMap({});
    };

    const handleRemovePlayer = (name) => {
        setPlayers(players.filter((player) => player !== name));
        setPlayersMap({});
    };

    const handleReset = () => {
        setPlayers([]);
        setInputValue("");
        setPlayersMap({});
    };

    const hasResult = Object.keys(playersMap).length > 0;
    const sortedPlayers = hasResult
        ? Object.keys(playersMap).sort((x, y) => playersMap[y] - playersMap[x])
        : [];
    const winnerName = sortedPlayers[0];
    const canStart = players.length >= 2;

    const graduallySetPlayResult = (finalResult, count) => {
        if (count <= 0) {
            return;
        }
        const result = {};
        const playerNames = Object.keys(finalResult);
        for (let i = 0; i < playerNames.length; i++) {
            result[playerNames[i]] = (finalResult[playerNames[i]] * (10 - count + 1)) / 10;
        }
        setPlayersMap(result);
        setTimeout(() => {
            graduallySetPlayResult(finalResult, count - 1);
        }, 50);
    };

    const handleBtnStart = () => {
        if (!canStart) {
            return;
        }
        const result = {};
        let maxIndex = -1;
        let maxPoint = -1;
        for (let i = 0; i < players.length; i++) {
            const score = getRandomInt(1, 101);
            result[players[i]] = score;
            if (score > maxPoint) {
                maxIndex = i;
                maxPoint = score;
            }
        }
        result[players[maxIndex]] = 100;
        graduallySetPlayResult(result, 10);
    };

    const renderPlayer = (item) => {
        const isWinner = item === winnerName;
        return (
            <PlayerRow $highlight={isWinner}>
                <PlayerRowContent>
                    <div>
                        <PlayerName>{item}</PlayerName>
                        {isWinner ? <Tag color="blue">Goes first</Tag> : null}
                    </div>
                    <PlayerProgress>
                        <Progress
                            percent={playersMap[item] || 0}
                            showInfo={false}
                            strokeColor={
                                isWinner ? "var(--chrome-blue)" : "rgba(15, 23, 42, 0.35)"
                            }
                        />
                    </PlayerProgress>
                    <PlayerActions>
                        <Button size="small" type="text" onClick={() => handleRemovePlayer(item)}>
                            Remove
                        </Button>
                    </PlayerActions>
                </PlayerRowContent>
            </PlayerRow>
        );
    };

    return (
        <Page>
            <Hero>
                <HeroTitle level={2}>Who goes first</HeroTitle>
                <HeroSubtitle>
                    Drop in names, then run a quick draw. The highest score takes the first slot.
                </HeroSubtitle>
            </Hero>

            <ContentGrid>
                <SectionCard>
                    <SectionHeader>
                        <SectionTitle>Participants</SectionTitle>
                        <Tag color="blue">{players.length} ready</Tag>
                    </SectionHeader>
                    <InputRow>
                        <InputGrow>
                            <Input
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                }}
                                onPressEnter={handlePlayersAdd}
                                placeholder="Add names, separated by commas"
                                allowClear
                            />
                        </InputGrow>
                        <ActionRow>
                            <Button
                                onClick={handlePlayersAdd}
                                type="primary"
                                disabled={!parsePlayersInput(inputValue).length}
                            >
                                Add
                            </Button>
                            <Button onClick={handleBtnStart} disabled={!canStart}>
                                Start draw
                            </Button>
                            <Button type="text" onClick={handleReset} disabled={!players.length}>
                                Reset
                            </Button>
                        </ActionRow>
                    </InputRow>
                    <HelperText>Tip: press Enter to add, or paste a comma list.</HelperText>
                    <List
                        size="small"
                        split={false}
                        dataSource={players}
                        renderItem={(item) => renderPlayer(item)}
                        locale={{
                            emptyText: (
                                <Empty description="Add two or more participants to start." />
                            ),
                        }}
                    />
                </SectionCard>

                <SectionCard>
                    <SectionHeader>
                        <SectionTitle>Result</SectionTitle>
                        <Tag color={hasResult ? "blue" : "default"}>
                            {hasResult ? "Locked" : "Waiting"}
                        </Tag>
                    </SectionHeader>
                    {hasResult ? (
                        <ResultBlock>
                            <ResultLabel>Goes first</ResultLabel>
                            <ResultName>{winnerName}</ResultName>
                            <ResultOrder>
                                In order: {sortedPlayers.join(", ")}
                            </ResultOrder>
                        </ResultBlock>
                    ) : (
                        <Empty description="Start the draw to see who goes first." />
                    )}
                </SectionCard>
            </ContentGrid>
        </Page>
    );
}

export { WhoGoesFirst };
