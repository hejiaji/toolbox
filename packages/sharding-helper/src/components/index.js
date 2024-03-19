import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Input } from 'antd';
import protobuf from 'protobufjs';

import shardingContextProto from '../awesome.proto';

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

const StyledShardingInput = styled(Input)`
    margin-top: 3rem;
    max-width: 500px;
`;

const StyledContent = styled.div`
    margin-top: 3rem;
`;


const ShardingHelper = () => {
    const [content, setContent] = useState("");
    const [shardingParser, setShardingParser] = useState(undefined);

    useEffect(() => {
        (async () => {
            const rootProto = await protobuf.load(shardingContextProto);
            setShardingParser(rootProto.lookupType('paas.sharding.ShardingContext'));
        })()
    }, []);

    const handleInputChange = (sharding) => {
        if (shardingParser) {
            try {
                const inputVaule = sharding.target.value;
                const result = shardingParser.decode(Buffer.from(decodeURIComponent(inputVaule), 'base64'));
                console.log(result);
                if (Object.keys(result).length !== 0) {
                    setContent(JSON.stringify(result, null, 2));
                } else {
                    setContent("invalid input");
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    return (
        <Container>
            <StyledShardingInput placeholder='sharding key' onChange={handleInputChange} />
            <StyledContent>
                <pre>{content}</pre>
            </StyledContent>
        </Container>
    )
};

export { ShardingHelper }
