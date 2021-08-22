import React from "react";
import {Typography, Divider, Input} from "antd";

const { Title } = Typography;

export const WhoGoesFirst = () => {
    return (
        <React.Fragment>
            <Typography>
                <Title>Who goes first</Title>
                <Divider/>
            </Typography>
            <Input placeholder="Add participants" />
        </React.Fragment>
    )
}
