import React, { useState, useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { Input, Card, Button, Typography, Alert } from "antd";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const { Title, Paragraph } = Typography;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 860px;
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

const PlayerWrapper = styled.div`
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  background: #000;

  .video-js {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
`;

const VideoPlayerInner = ({ src }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{ src }],
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline />
    </div>
  );
};

const VideoPlayer = () => {
  const [url, setUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [error, setError] = useState("");

  const handlePlay = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste a pre-signed S3 URL.");
      return;
    }
    setError("");
    setActiveUrl(trimmed);
  }, [url]);

  return (
    <Container>
      <StyledCard>
        <Typography>
          <Title level={3}>Video Player</Title>
          <Paragraph>
            Paste a pre-signed S3 URL to play the video directly in the browser.
          </Paragraph>
          <Paragraph type="secondary" style={{ fontSize: "0.85rem" }}>
            Example: http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
          </Paragraph>
        </Typography>
        <InputRow>
          <StyledInput
            placeholder="Paste pre-signed S3 video URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            onPressEnter={handlePlay}
          />
          <Button type="primary" onClick={handlePlay}>
            Play
          </Button>
        </InputRow>
        {error ? (
          <Alert
            style={{ marginTop: "1rem" }}
            type="warning"
            showIcon
            message={error}
          />
        ) : null}
        {activeUrl ? (
          <PlayerWrapper>
            <VideoPlayerInner key={activeUrl} src={activeUrl} />
          </PlayerWrapper>
        ) : null}
      </StyledCard>
    </Container>
  );
};

export { VideoPlayer };
