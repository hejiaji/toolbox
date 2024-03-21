import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Input, Card, Button } from 'antd';
import copy from "copy-to-clipboard";
import protobuf from 'protobufjs';

import shardingContextProto from '../awesome.proto';

const StyledCard = styled(Card)`
    width: 50%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media (min-width: 768px) {
    padding: 2rem 5rem;
  }
  @media (max-width: 768px) {
    padding: 1rem 1rem;
  }
  
  .ant-typography {
      width: 100%;
      @media (min-width: 768px) {
          width: 600px;
      }
  }
`;

const StyledInputContainer = styled.div`
    display: flex;
`;


const StyledShardingInput = styled(Input)`
    max-width: 500px;
`;

const StyledContent = styled.div`
    margin-top: 3rem;
`;


const ShardingHelper = () => {
    const [decodeContent, setDecodeContent] = useState("");
    const [encodeContent, setEncodeContent] = useState("");
    const [shardingParser, setShardingParser] = useState(undefined);
    const [ari, setAri] = useState("");
    const [partitionId, setPartitionId] = useState("");

    useEffect(() => {
        (async () => {
            const rootProto = await protobuf.load(shardingContextProto);
            setShardingParser(rootProto.lookupType('paas.sharding.ShardingContext'));
        })()
    }, []);

    useEffect(() => {
        if (!ari || !partitionId) {
            setEncodeContent("");
            return;
        }
        if (shardingParser) {
            try {
                const result = shardingParser.encode({
                    partition: {
                        idAsString: partitionId,
                    },
                    contextId: {
                        ari: ari,
                    }
                }).finish();
                console.log(result);
                setEncodeContent(Buffer.from(result).toString("base64"));
            } catch (e) {
                console.log(e);
            }
        }
    }, [ari, partitionId]);

    const handleDecodeInputChange = (sharding) => {
        if (shardingParser) {
            try {
                const inputVaule = sharding.target.value;
                const result = shardingParser.decode(Buffer.from(decodeURIComponent(inputVaule), 'base64'));
                console.log(result);
                if (Object.keys(result).length !== 0) {
                    setDecodeContent(JSON.stringify(result, null, 2));
                } else {
                    setDecodeContent("invalid input");
                }
            } catch (e) {
                console.log(e);
            }
        }
    }



    return (
        <Container>
            <Button onClick={() => {
                copy('CmoKaGFyaTpjbG91ZDpjb25mbHVlbmNlOjQyM2MwNzM5LWE0ODUtNDJiMy04NTU5LTIwNjI1YzVmMzU5OTp3b3Jrc3BhY2UvMzM3OTgxZWItZjYzYy00NjhkLTkwMDEtZDU4MDdmYzQ4ZjcyEiYKJGIxY2U5ZmM4LThjYTEtNDZhYS04NDliLTg4MzY0ZDA5ZThkNw')
            }} type={"primary"}>Copy Example</Button>
            <StyledCard style={{ marginTop: '1rem' }} title="Decode">
                <StyledShardingInput placeholder='sharding key' onChange={handleDecodeInputChange} />
                <StyledContent>
                    <pre>{decodeContent}</pre>
                </StyledContent>
            </StyledCard>
            <StyledCard style={{ marginTop: '2rem' }} title="Encode">
               <StyledInputContainer>
                    <StyledShardingInput placeholder='ari' onChange={(i) => { setAri(i.target.value) }} />
                    <StyledShardingInput style={{ marginLeft: '1rem' }} placeholder='partition id' onChange={(i) => { setPartitionId(i.target.value) }} />
               </StyledInputContainer>
                <StyledContent>
                    <pre>{encodeContent}</pre>
                </StyledContent>
            </StyledCard>
        </Container>
    )
};

export { ShardingHelper }
