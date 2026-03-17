import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { VIDEO_LIBRARY, CATEGORIES } from "../library";
import HeroBanner from "./HeroBanner";
import CategoryRow from "./CategoryRow";

const Page = styled.div`
  background: #141414;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: #141414;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    padding: 0.6rem 0.75rem;
    gap: 0.5rem;
  }
`;

const LibraryTitle = styled.div`
  color: #e50914;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.45rem 0.9rem;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  width: 220px;
  transition: border-color 0.2s, background 0.2s;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: #888;
  }

  &:focus {
    border-color: #e50914;
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 600px) {
    width: 100%;
    font-size: 16px; /* prevents iOS auto-zoom */
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 600px) {
    gap: 0.35rem;
  }
`;

const Tab = styled.button`
  background: ${({ $active }) => ($active ? "#e50914" : "rgba(255,255,255,0.1)")};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.35rem 1rem;
  font-size: 0.82rem;
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    background: ${({ $active }) => ($active ? "#b20710" : "rgba(255,255,255,0.2)")};
  }

  @media (max-width: 600px) {
    padding: 0.4rem 0.9rem;
    font-size: 0.8rem;
  }
`;

const Content = styled.div`
  padding: 1.5rem 0 2rem;

  @media (max-width: 600px) {
    padding: 1rem 0 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 4rem 2rem;
  font-size: 1rem;
`;

const LibraryHome = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredVideo = useMemo(
    () => VIDEO_LIBRARY.find((v) => v.featured) || VIDEO_LIBRARY[0],
    []
  );

  const filteredVideos = useMemo(() => {
    let list = VIDEO_LIBRARY;
    if (activeCategory !== "All") {
      list = list.filter((v) => v.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeCategory]);

  const groupedByCategory = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      videos: filteredVideos.filter((v) => v.category === cat),
    })).filter((group) => group.videos.length > 0);
  }, [filteredVideos]);

  const showHero = !search.trim() && activeCategory === "All";

  return (
    <Page>
      <TopBar>
        <LibraryTitle>🎬 My Library</LibraryTitle>
        <SearchInput
          placeholder="Search titles, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterTabs>
          {["All", ...CATEGORIES].map((cat) => (
            <Tab
              key={cat}
              $active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Tab>
          ))}
        </FilterTabs>
      </TopBar>

      {showHero && <HeroBanner video={featuredVideo} />}

      <Content>
        {groupedByCategory.length > 0 ? (
          groupedByCategory.map(({ category, videos }) => (
            <CategoryRow key={category} category={category} videos={videos} />
          ))
        ) : (
          <EmptyState>No videos found for "{search}"</EmptyState>
        )}
      </Content>
    </Page>
  );
};

export default LibraryHome;
