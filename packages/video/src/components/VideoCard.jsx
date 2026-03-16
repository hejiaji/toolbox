import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

const Card = styled.div`
  position: relative;
  flex: 0 0 220px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #1a1a1a;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8);
    z-index: 10;
  }
`;

const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #2a2a2a;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const FallbackThumb = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #e50914;
  font-size: 2.5rem;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.75rem;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const PlayBtn = styled.button`
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 0.4rem;
  width: fit-content;
  transition: background 0.15s;

  &:hover {
    background: #b20710;
  }
`;

const OverlayDesc = styled.p`
  font-size: 0.7rem;
  color: #ccc;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Info = styled.div`
  padding: 0.5rem 0.6rem 0.6rem;
`;

const Title = styled.div`
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  color: #aaa;
  font-size: 0.72rem;
  margin-top: 0.15rem;
`;

const VideoCard = ({ video }) => {
  const history = useHistory();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    history.push(`/video/${video.id}`);
  };

  return (
    <Card onClick={handleClick}>
      <Thumbnail>
        {!imgError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackThumb>▶</FallbackThumb>
        )}
      </Thumbnail>
      <Overlay>
        <PlayBtn>▶ Play</PlayBtn>
        <OverlayDesc>{video.description}</OverlayDesc>
      </Overlay>
      <Info>
        <Title>{video.title}</Title>
        <Meta>{video.year} · {video.duration}</Meta>
      </Info>
    </Card>
  );
};

export default VideoCard;
