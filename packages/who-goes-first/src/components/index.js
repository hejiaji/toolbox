import React, { useState } from "react";
import styled from "styled-components";
import { Typography, Divider, Input, Button, List, Result, Progress } from "antd";

const { Title } = Typography;

const Container = styled.div`
    padding: 0 1rem;
`;

const BtnAdd = styled(Button)`
`;

const BtnStart = styled(Button)`
    margin-left: 0.5rem;
`;

const Operation = styled.div`
    margin-top: 1rem;
`;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function WhoGoesFirst() {
    const [players, setPlayers] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [playersMap, setPlayersMap] = useState([]);

    const handPlayersAdd = () => {
        const newPlayers = inputValue.split(",")
        const allPlayers = [...players, ...newPlayers];
        setPlayers([...new Set(allPlayers)]);
    };

    const hasResult = Object.keys(playersMap).length > 0;

    const graduallySetPlayResult = (finalResult, count) => {
        if (count <= 0) {
            return;
        }
        let result = {};
        const playerNames = Object.keys(finalResult);
        for (let i = 0; i < playerNames.length; i++) {
            result[playerNames[i]] = (finalResult[playerNames[i]] * (10 - count + 1)) / 10;
        }
        setPlayersMap(result);
        setTimeout(() => {
            graduallySetPlayResult(finalResult, count-1);
        }, 50);
    }

    const handleBtnStart = () => {
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
        return (
            <List.Item>
                {item}
                <Progress percent={playersMap[item] || 0} />
            </List.Item>
        )
    }

    const renderResult = () => {
        if (!hasResult) {
            return null;
        }
        const sortedPlayers = Object.keys(playersMap).sort((x, y) => playersMap[y] - playersMap[x]);
        return (
            <Result
                status="success"
                title={`${sortedPlayers[0]} goes first!`}
                subTitle={`In order: ${sortedPlayers.join(",")}`}
            />
        )
    }

    return (
        <Container>
            <Typography>
                <Title>Who goes first</Title>
                <Divider/>
            </Typography>
            <Input onChange={(e) => { setInputValue(e.target.value) }} placeholder="Add participants"/>
            <Operation>
                <BtnAdd onClick={handPlayersAdd} type="primary">Add</BtnAdd>
                <BtnStart onClick={handleBtnStart}>Start</BtnStart>
            </Operation>
            <List
                size="large"
                dataSource={players}
                renderItem={item => renderPlayer(item)}
            />
            {renderResult()}
        </Container>
    )
}

export { WhoGoesFirst };