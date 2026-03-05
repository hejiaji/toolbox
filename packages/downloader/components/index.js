import React, { useState } from "react";
import styled from "styled-components";
import { Input, Card, Button, Typography, Alert, Switch } from "antd";

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

const DebugRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: #6b7280;
`;

const DebugPanel = styled.pre`
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const ResultLabel = styled(Text)`
  display: block;
  margin-bottom: 0.35rem;
  color: #6b7280;
`;

const DownloadButton = styled(Button)`
  min-width: 150px;
`;

const SHARE_URL_REGEX = /https?:\/\/[\w.-]+(?:\/[^\s]*)?/gi;
const DOUYIN_SHORT_REGEX = /(v\.douyin\.com\/[\w-]+\/?)/i;
const TIKTOK_SHORT_REGEX = /((?:vm|vt)\.tiktok\.com\/[\w-]+\/?)/i;
const sanitizeUrl = (url) => {
  return url
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/[),.!?，。？！】》>]+$/g, "");
};

const extractFirstUrl = (inputValue) => {
  const matches = inputValue.match(SHARE_URL_REGEX);
  if (matches && matches.length > 0) {
    return sanitizeUrl(matches[0]);
  }

  const douyinMatch = inputValue.match(DOUYIN_SHORT_REGEX);
  if (douyinMatch) {
    return `https://${sanitizeUrl(douyinMatch[1])}`;
  }

  const tiktokMatch = inputValue.match(TIKTOK_SHORT_REGEX);
  if (tiktokMatch) {
    return `https://${sanitizeUrl(tiktokMatch[1])}`;
  }

  return "";
};

const resolveRawVideoUrl = async (inputValue, debugEnabled) => {
  const sharedUrl = extractFirstUrl(inputValue);
  if (!sharedUrl) {
    throw new Error("Paste a TikTok or Douyin share link.");
  }

  const normalizedUrl = /^https?:\/\//i.test(sharedUrl)
    ? sharedUrl
    : `https://${sharedUrl}`;

  const url = debugEnabled
    ? "http://localhost:4000/api/resolve?debug=1"
    : "http://localhost:4000/api/resolve";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: normalizedUrl }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Unable to resolve raw video URL.");
  }

  if (!payload?.url) {
    throw new Error(payload?.error || "Unable to resolve raw video URL.");
  }

  return payload;
};

const Downloader = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugTrace, setDebugTrace] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setOutputUrl("");
    setDebugTrace("");

    try {
      const payload = await resolveRawVideoUrl(inputValue, debugEnabled);
      setOutputUrl(payload.url);
      if (debugEnabled) {
        setDebugTrace(JSON.stringify(payload.trace || [], null, 2));
      }
    } catch (err) {
      setError(err?.message || "Unable to resolve raw video link.");
    } finally {
      setIsLoading(false);
    }
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
              setError("");
              setOutputUrl("");
              setDebugTrace("");
            }}
            onPressEnter={handleSubmit}
          />
          <DownloadButton type="primary" loading={isLoading} onClick={handleSubmit}>
            Download
          </DownloadButton>
        </InputRow>
        <DebugRow>
          <Switch checked={debugEnabled} onChange={(value) => setDebugEnabled(value)} />
          <Text>Include debug trace</Text>
        </DebugRow>
        {error ? (
          <Alert
            style={{ marginTop: "1rem" }}
            type="warning"
            showIcon
            message={error}
          />
        ) : null}
        {outputUrl ? (
          <ResultPanel>
            <ResultLabel>Raw video link</ResultLabel>
            <Text copyable>{outputUrl}</Text>
          </ResultPanel>
        ) : null}
        {debugTrace ? <DebugPanel>{debugTrace}</DebugPanel> : null}
      </StyledCard>
    </Container>
  );
};

export { Downloader };
