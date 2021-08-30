import React, { useState } from "react";
import { Typography, Divider, Input, Button, Progress } from "antd";

const { Title } = Typography;

function WhoGoesFirst() {
    const [players, setPlayers] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const handPlayersAdd = () => {
        const newPlayers = inputValue.split(",")
        setPlayers([...players, ...newPlayers]);
    }

    const renderPlayers = () => {
        return (
            <div>
                {players.map((x) =>
                    (
                        <div>{x}</div>
                    ))}
            </div>
        )
    }

    return (
        <React.Fragment>
            <Typography>
                <Title>Who goes first</Title>
                <Divider/>
            </Typography>
            <Input onChange={(e) => { setInputValue(e.target.value) }} placeholder="Add participants"/>
            <Button onClick={handPlayersAdd} type="primary">Add</Button>
            {renderPlayers()}
        </React.Fragment>
    )
}

export { WhoGoesFirst };