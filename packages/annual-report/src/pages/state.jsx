import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

import styled from "styled-components";

import { IAuditorMarkOnly } from "../svgs/iAuditor-svg";

import Introduction from "../components/slides/introduction";
import Summary from "../components/slides/summary";
import Insights from "../components/slides/insights";
import Recommendations from "../components/slides/recommendations";
import Share from "../components/slides/share";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: white;
`;

const LogoContainer = styled(motion.div)`
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  z-index: 999;
`;

const SlideContainer = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 40%;
  height: 100%;
  overflow: hidden;
  opacity: 0;

  color: #1c388f;

  strong {
    color: #ff914d;
  }
`;

const slideVariants = {
  slideIn: {
    opacity: 1,
    top: "0",
    transition: { ease: "easeOut", duration: 1.5 },
  },
  slideOut: {
    opacity: 0,
    top: "40%",
    transition: { ease: "easeOut", duration: 1.5 },
  },
};

const State = () => {
  const logoAnimation = useAnimation();
  const frontSlideAnimation = useAnimation();
  const backSlideAnimation = useAnimation();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSlideReady, setSlideReady] = useState(false);

  const addSlideIndex = () => setSlideIndex((prev) => prev + 1);
  const isFrontSlideActive = slideIndex % 2 === 0;

  const resetLogo = () => {
    logoAnimation.start({
      scale: 3,
      top: "4%",
      left: "10%",
      transition: { ease: "easeOut", duration: 1.5 },
    });
  };

  useEffect(() => {
    logoAnimation
      .start({
        scale: 12,
        transition: { ease: "easeOut", duration: 1 },
      })
      .then(() =>
        Promise.all([
          logoAnimation.start({
            rotate: 360,
            transition: { duration: 0.5 },
          }),
          logoAnimation.start({
            scale: 5,
            top: "25%",
            transition: { ease: "easeOut", duration: 2 },
          }),
          frontSlideAnimation.start("slideIn"),
        ]),
      )
      .then(() => {
        setSlideReady(true);
      });
  }, [logoAnimation, frontSlideAnimation]);

  const nextSlide = () => {
    setSlideReady(false);
    requestAnimationFrame(() => {
      Promise.all([
        frontSlideAnimation.start(isFrontSlideActive ? "slideOut" : "slideIn"),
        backSlideAnimation.start(isFrontSlideActive ? "slideIn" : "slideOut"),
      ]).then(() => {
        addSlideIndex();
        setSlideReady(true);
      });
    });
  };

  const renderSlide = (index, isReady) => {
    switch (index) {
      case 0:
        return (
          <Introduction
            ready={isReady}
            onTitleEnd={resetLogo}
            onEnd={nextSlide}
          />
        );
      case 1:
        return <Summary ready={isReady} onEnd={nextSlide} />;
      case 2:
        return <Insights ready={isReady} onEnd={nextSlide} />;
      case 3:
        return <Recommendations ready={isReady} onEnd={nextSlide} />;
      case 4:
        return <Share ready={isReady} />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <LogoContainer animate={logoAnimation}>
        <IAuditorMarkOnly size={14} />
      </LogoContainer>
      <SlideContainer animate={frontSlideAnimation} variants={slideVariants}>
        {renderSlide(
          isFrontSlideActive ? slideIndex : slideIndex + 1,
          isFrontSlideActive && isSlideReady,
        )}
      </SlideContainer>
      <SlideContainer animate={backSlideAnimation} variants={slideVariants}>
        {renderSlide(
          !isFrontSlideActive ? slideIndex : slideIndex + 1,
          !isFrontSlideActive && isSlideReady,
        )}
      </SlideContainer>
    </Container>
  );
};

export default State;
