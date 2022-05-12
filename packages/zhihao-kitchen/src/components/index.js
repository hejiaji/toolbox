import React, { useState } from "react";
import styled, { css } from "styled-components";
import { Divider, Typography, List, Avatar, Button, DatePicker, message } from "antd";
import moment from "moment";

import { CheckCircleOutlined } from "@ant-design/icons";
import copy from "copy-to-clipboard";

const { Title } = Typography;

const StyledTitle = styled(Title)`
  margin-top: 1rem;  
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 768px) {
    padding: 0 5rem;
  }
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
  
  .ant-typography {
    width: 100%;
    @media (min-width: 768px) {
      width: 600px;
    }
  }
`;

const ButtonContainer = styled.div`
  padding-left: 1rem;
  button {
    margin-left: 1rem;
  }
`;


const StyledItemMeta = styled(List.Item.Meta)`
  .ant-list-item-meta-title {
    margin-bottom: 0;
    line-height: 32px;
  }
  padding: 0.5rem 0;
`;

const StyledItem = styled(({ isSelected, ...props }) => <List.Item {...props} />)`
  display: flex;
  align-items: center;
  justify-content: center;


  &:hover {
    background: rgba(60, 90, 100, .04);
    cursor: pointer;
  }
`;



const data = [{ title: "陈记土豆丝" }, { title: "麻婆豆腐" }, { title: "镜面蒸蛋羹" }, { title: "水煮鱼" }]
const avatarUrl = "https://joeschmoe.io/api/v1/jake";

function ZhihaoKitchen() {
    const [items, setItems] = useState([]);
    const [date, setDate] = useState(moment());
    const handleItemClick = (title) => {
        setItems(!items.includes(title) ? [...items, title] : items.filter(x => x!== title));
    }

    const handleDateChange = (newDate) => {
        setDate(newDate);
    }

    const handleSubmit = () => {
        if(items.length === 0 || !date) {
            message.error("请选择菜品和日期");
        }
        const dish = items.reduce((sum, item) => {
            return `${sum}${item}\n`
        }, "");
        const text = `陈厨您好，\n请在${date.format("YYYY-MM-DD")}准备好如下菜品\n${dish}敬候`
        copy(text)
        message.info("请求已复制，请发送给陈厨");
    }

    const renderItem = (item) => {
        const isSelected = items.includes(item.title);
        const extra = isSelected ? (<CheckCircleOutlined style={{ fontSize: '2rem', color: "green" }} />) : null;
        return (
            <StyledItem onClick={() => handleItemClick(item.title)} extra={extra}>
                <StyledItemMeta
                    avatar={<Avatar src={avatarUrl} />}
                    title={item.title}
                />
            </StyledItem>
        )
    }

    return (
        <Container>
            <Typography>
                <StyledTitle>陈厨菜单</StyledTitle>
                <Divider/>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={renderItem}
                    split={false}
                />
                <Divider/>
                <ButtonContainer>
                    <DatePicker value={date} placeholder="日期" onChange={handleDateChange} />
                    <Button onClick={handleSubmit} shape="round" type="primary">预定</Button>
                </ButtonContainer>
            </Typography>
        </Container>
    )
}

export { ZhihaoKitchen };
