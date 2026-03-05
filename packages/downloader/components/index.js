import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Input, Card, Button, Typography, Alert } from "antd";

const { Title, Paragraph, Text } = Typography;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 760px;
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const StyledInput = styled(Input)`
  flex: 1;
`;

const ResultPanel = styled.div`
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
`;

const ResultLabel = styled(Text)`
  display: block;
  margin-bottom: 0.35rem;
  color: #6b7280;
`;

const DownloadButton = styled(Button)`
  min-width: 150px;
`;

const extractRawVideoUrl = (inputValue) => {
  const trimmed = inputValue.trim();
  if (!trimmed) {
    return { url: "", error: "" };
  }

  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();
    if (!hostname.includes("tiktok.com") && !hostname.includes("douyin.com")) {
      return { url: "", error: "Only TikTok and Douyin links are supported." };
    }
    return { url: url, error: "" };
  } catch (error) {
    return { url: "", error: "Please enter a valid TikTok or Douyin link." };
  }
};

const Downloader = () => {
  const [inputValue, setInputValue] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { url, error } = useMemo(() => extractRawVideoUrl(inputValue), [inputValue]);
  const showResult = hasSubmitted && (url || error);

  const handleSubmit = () => {
    setHasSubmitted(true);
  };

  return (
    <Container>
      <StyledCard>
        <Typography>
          <Title level={3}>TikTok & Douyin Raw Link</Title>
          <Paragraph>
            Paste the video link, then click download to reveal the raw video URL.
          </Paragraph>
        </Typography>
        <InputRow>
          <StyledInput
            placeholder="Paste TikTok or Douyin share link"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (hasSubmitted) {
                setHasSubmitted(false);
              }
            }}
          />
          <DownloadButton type="primary" onClick={handleSubmit}>
            Download
          </DownloadButton>
        </InputRow>
        {showResult ? (
          error ? (
            <Alert
              style={{ marginTop: "1rem" }}
              type="warning"
              showIcon
              message={error}
            />
          ) : (
            <ResultPanel>
              <ResultLabel>Raw video link</ResultLabel>
              <Text copyable>{url}</Text>
            </ResultPanel>
          )
        ) : null}
      </StyledCard>
    </Container>
  );
};

export { Downloader };
