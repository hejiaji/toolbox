import React, { useState } from "react";
import styled from "styled-components";
import { Typography, Divider, Input, Button, List, Result } from "antd";

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
    const [playersOrder, setPlayersOrder] = useState([]);

    const handPlayersAdd = () => {
        const newPlayers = inputValue.split(",")
        const allPlayers = [...players, ...newPlayers];
        setPlayers([...new Set(allPlayers)]);
    };

    const handleBtnStart = () => {
        const result = [];
        let remainingPlayers = [...players];
        while (remainingPlayers.length > 0) {
            const picked = getRandomInt(0, remainingPlayers.length);
            const pickedPlayer = remainingPlayers[picked];
            result.push(pickedPlayer);
            remainingPlayers = remainingPlayers.filter(x => x !== pickedPlayer)
        }
        setPlayersOrder(result);
    };

    const renderPlayer = (item) => {
        return (
            <List.Item>
                {item}
            </List.Item>
        )
    }

    const renderResult = () => {
        if (playersOrder.length === 0) {
            return null;
        }
        return (
            <Result
                status="success"
                title={`${playersOrder[0]} goes first!`}
                subTitle={`In order: ${playersOrder.join(",")}`}
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