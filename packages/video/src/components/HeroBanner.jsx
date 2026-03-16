import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useHistory } from "react-router-dom";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Banner = styled.div`
  position: relative;
  width: 100%;
  height: 520px;
  background: #0a0a0a;
  overflow: hidden;
  display: flex;
  align-items: flex-end;

  @media (max-width: 768px) {
    height: 340px;
  }
`;

const BgImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center top;
  filter: brightness(0.5);
`;

const BgFallback = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #2a0a0a 100%);
`;

const Gradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    transparent 100%
  ),
  linear-gradient(
    to top,
    rgba(20, 20, 20, 1) 0%,
    transparent 40%
  );
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  padding: 2.5rem 3rem;
  max-width: 560px;
  animation: ${fadeIn} 0.6s ease both;

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 100%;
  }
`;

const FeaturedLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #e50914;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0 0 0.75rem;
  line-height: 1.1;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.8);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Meta = styled.div`
  color: #bbb;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  color: #ddd;
`;

const Description = styled.p`
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    -webkit-line-clamp: 2;
    font-size: 0.85rem;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const PlayButton = styled.button`
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: #b20710;
    transform: scale(1.03);
  }
`;

const InfoButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const HeroBanner = ({ video }) => {
  const history = useHistory();
  const [imgError, setImgError] = useState(false);

  if (!video) return null;

  return (
    <Banner>
      {!imgError && video.thumbnail ? (
        <BgImage
          $src={video.thumbnail}
          onError={() => setImgError(true)}
        />
      ) : (
        <BgFallback />
      )}
      <Gradient />
      <Content>
        <FeaturedLabel>⭐ Featured</FeaturedLabel>
        <Title>{video.title}</Title>
        <Meta>
          <span>{video.year}</span>
          <span>{video.duration}</span>
          <span>{video.category}</span>
        </Meta>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {video.tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
        <Description>{video.description}</Description>
        <Buttons>
          <PlayButton onClick={() => history.push(`/video/${video.id}`)}>
            ▶ Play Now
          </PlayButton>
          <InfoButton onClick={() => history.push(`/video/${video.id}`)}>
            ℹ More Info
          </InfoButton>
        </Buttons>
      </Content>
    </Banner>
  );
};

export default HeroBanner;
