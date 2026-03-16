import React, { useRef } from "react";
import styled from "styled-components";
import VideoCard from "./VideoCard";

const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  margin-bottom: 0.75rem;
`;

const CategoryTitle = styled.h2`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const ScrollBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const ScrollButtons = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 1.5rem 1rem;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 2px;
  }
`;

const CategoryRow = ({ category, videos }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: direction * 500, behavior: "smooth" });
    }
  };

  return (
    <Section>
      <RowHeader>
        <CategoryTitle>{category}</CategoryTitle>
        <ScrollButtons>
          <ScrollBtn onClick={() => scroll(-1)}>‹</ScrollBtn>
          <ScrollBtn onClick={() => scroll(1)}>›</ScrollBtn>
        </ScrollButtons>
      </RowHeader>
      <Row ref={rowRef}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </Row>
    </Section>
  );
};

export default CategoryRow;
