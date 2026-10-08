import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { useParams, useHistory, useLocation } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { VIDEO_LIBRARY, getPlayableEpisodes, getVideoSource, getVideoLengthLabel } from "../library";

const Page = styled.div`
  background: #141414;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #fff;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #0a0a0a;

  @media (max-width: 600px) {
    padding: 0.6rem 0.75rem;
  }
`;

const BackBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.45rem 1.1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LibraryLabel = styled.div`
  color: #e50914;
  font-weight: 800;
  font-size: 1.1rem;
`;

const PlayerSection = styled.div`
  background: #000;
  width: 100%;

  .video-js {
    width: 100%;
    max-height: 72vh;
    aspect-ratio: 16 / 9;
  }
`;

const EpisodeControls = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  max-width: 860px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  color: #ccc;

  select {
    max-width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #555;
    border-radius: 6px;
    background: #1a1a1a;
    color: #fff;
    font: inherit;
    font-size: 1rem;
    cursor: pointer;
  }

  select:focus-visible {
    outline: 2px solid #e50914;
    outline-offset: 2px;
  }
`;

const UnavailablePlayer = styled.div`
  padding: 5rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);

  h2 {
    color: #fff;
    font-size: 1.5rem;
    margin: 0 0 0.75rem;
  }

  p {
    color: #ccc;
    margin: 0;
  }
`;

const InfoSection = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;

  @media (max-width: 600px) {
    padding: 1rem 0.75rem 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;

  @media (max-width: 600px) {
    font-size: 1.3rem;
  }

  @media (max-width: 380px) {
    font-size: 1.1rem;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const CategoryBadge = styled.span`
  background: #e50914;
  color: #fff;
  border-radius: 4px;
  padding: 0.15rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
`;

const TagsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  color: #ccc;
`;

const Description = styled.p`
  color: #ccc;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 2rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #2a2a2a;
  margin-bottom: 1.5rem;
`;

const SuggestionsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
`;

const SuggestionsGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    gap: 0.5rem;
  }
`;

const SuggThumbFallback = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  font-size: 1.5rem;
  color: #e50914;
  gap: 0.3rem;

  span {
    font-size: 0.6rem;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

const SuggCard = styled.div`
  flex: 0 0 180px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  background: #1a1a1a;
  transition: transform 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
    background: #2a2a2a;
  }

  div {
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
    color: #ddd;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 600px) {
    flex: 0 0 140px;
  }
`;

const NotFound = styled.div`
  text-align: center;
  color: #666;
  padding: 6rem 2rem;
  font-size: 1.1rem;
`;

const SEEK_SECONDS = 15;

const PlayerWrapper = styled.div`
  position: relative;
`;

const SeekToast = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  pointer-events: none;
  z-index: 5;
  opacity: ${(p) => (p.visible ? 1 : 0)};
  transform: translate(-50%, -50%) scale(${(p) => (p.visible ? 1 : 0.9)});
  transition: opacity 200ms ease, transform 200ms ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
`;

const VideoPlayerInner = ({ src }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const [toast, setToast] = useState({ visible: false, text: "" });

  const showToast = useCallback((text) => {
    setToast({ visible: true, text });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 700);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: true,
      sources: [{ src }],
    });
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) return false;
      const tag = (target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const handleKeyDown = (e) => {
      const player = playerRef.current;
      if (!player) return;
      // Don't hijack keys while the user is typing in an input.
      if (isTypingTarget(e.target)) return;
      // Ignore when modifier keys are held so we don't override browser shortcuts.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const currentTime =
        typeof player.currentTime === "function" ? player.currentTime() : 0;
      const duration =
        typeof player.duration === "function" ? player.duration() : 0;

      switch (e.key) {
        case "ArrowRight":
        case "l":
        case "L": {
          const target = duration
            ? Math.min(duration, currentTime + SEEK_SECONDS)
            : currentTime + SEEK_SECONDS;
          player.currentTime(target);
          showToast(`⏩ +${SEEK_SECONDS}s`);
          e.preventDefault();
          break;
        }
        case "ArrowLeft":
        case "j":
        case "J": {
          const target = Math.max(0, currentTime - SEEK_SECONDS);
          player.currentTime(target);
          showToast(`⏪ -${SEEK_SECONDS}s`);
          e.preventDefault();
          break;
        }
        case " ":
        case "k":
        case "K": {
          if (player.paused()) {
            player.play();
            showToast("▶ Play");
          } else {
            player.pause();
            showToast("⏸ Pause");
          }
          e.preventDefault();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showToast]);

  return (
    <PlayerWrapper>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline />
      </div>
      <SeekToast visible={toast.visible} aria-live="polite">
        {toast.text}
      </SeekToast>
    </PlayerWrapper>
  );
};

const VideoDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();

  const video = VIDEO_LIBRARY.find((v) => v.id === id);

  if (!video) {
    return (
      <Page>
        <TopBar>
          <BackBtn onClick={() => history.push("/video")}>← Back to Library</BackBtn>
        </TopBar>
        <NotFound>Video not found.</NotFound>
      </Page>
    );
  }

  const episodes = getPlayableEpisodes(video);
  const requestedEpisode = new URLSearchParams(location.search).get("episode");
  const selectedEpisode = episodes.find((episode) => String(episode.number) === requestedEpisode) || episodes[0];
  const playbackSrc = selectedEpisode ? selectedEpisode.src : getVideoSource(video);

  const selectEpisode = (event) => {
    const params = new URLSearchParams(location.search);
    params.set("episode", event.target.value);
    history.replace({ ...location, search: `?${params.toString()}` });
  };

  const suggestions = VIDEO_LIBRARY.filter(
    (v) => v.id !== video.id && v.category === video.category
  ).slice(0, 6);

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => history.push("/video")}>← Back to Library</BackBtn>
        <LibraryLabel>🎬 My Library</LibraryLabel>
      </TopBar>

      <PlayerSection>
        {selectedEpisode && (
          <EpisodeControls>
            <label htmlFor="episode-selector">Episode</label>
            <select id="episode-selector" value={selectedEpisode.number} onChange={selectEpisode}>
              {episodes.map((episode) => (
                <option key={episode.number} value={episode.number}>{episode.title}</option>
              ))}
            </select>
            <span>{episodes.length} available</span>
          </EpisodeControls>
        )}
        {playbackSrc ? (
          <VideoPlayerInner key={playbackSrc} src={playbackSrc} />
        ) : (
          <UnavailablePlayer>
            <h2>{video.category === "TV Shows" ? "Episodes coming soon" : "Video coming soon"}</h2>
            <p>Playback will be available once videos are added.</p>
          </UnavailablePlayer>
        )}
      </PlayerSection>

      <InfoSection>
        <Title>{video.title}</Title>
        <MetaRow>
          <CategoryBadge>{video.category}</CategoryBadge>
          <span>{video.year}</span>
          <span>{getVideoLengthLabel(video)}</span>
          {video.imdbUrl && (
            <a href={video.imdbUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#ccc", textDecoration: "underline" }}>
              View on IMDb ↗
            </a>
          )}
        </MetaRow>
        <TagsRow>
          {video.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </TagsRow>
        <Description>{video.description}</Description>

        {suggestions.length > 0 && (
          <>
            <Divider />
            <SuggestionsTitle>More in {video.category}</SuggestionsTitle>
            <SuggestionsGrid>
              {suggestions.map((s) => (
                <SuggCard key={s.id} onClick={() => history.push(`/video/${s.id}`)}>
                  {s.thumbnail ? (
                    <img
                      src={s.thumbnail}
                      alt={s.title}
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                  ) : null}
                  <SuggThumbFallback style={{ display: s.thumbnail ? "none" : "flex" }}>
                    🎬<span>No Thumbnail</span>
                  </SuggThumbFallback>
                  <div>{s.title}</div>
                  {!getVideoSource(s) && <div style={{ color: "#e6b96d" }}>Coming soon</div>}
                </SuggCard>
              ))}
            </SuggestionsGrid>
          </>
        )}
      </InfoSection>
    </Page>
  );
};

export default VideoDetail;
