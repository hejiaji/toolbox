import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

import styled from "styled-components";


import { ShareSvg } from "../../svgs/share-svg";
import treePNG from "../../svgs/tree.png";
import { Slide, FadeInList, FadeInListItem, H1, Caption } from "./styles";
import { TriangleSvg } from "../../svgs/triangle-svg";
import { PotatoSvg } from "../../svgs/potato-svg";
import { FADE_IN_OUT } from "../../constants/variants";

const TopLeft = styled.div`
  position: absolute;
  top: -0.5rem;
  left: -0.5rem;
  transform: rotate(90deg);
`;

const TopRight = styled.div`
  position: absolute;
  top: -4rem;
  right: -4rem;
  transform: rotate(49deg);
`;

const BottomLeft = styled.div`
  position: absolute;
  bottom: -4rem;
  left: -4rem;
  transform: rotate(49deg);
`;

const BottomRight = styled.div`
  position: absolute;
  bottom: -0.5rem;
  right: -0.5rem;
  transform: rotate(270deg);
`;

const ShareButton = styled(motion.div)`
  display: inline-block;
  align-items: center;
  color: white;
  background: #006ed5;
  padding: 0.5rem 1rem;
  border-radius: 5px;

  svg {
    margin-right: 0.25rem;
  }
`;

const TreeContainer = styled.div`
  position: relative;

  img {
    position: absolute;
    top: -50px;
    right: 20px;
    width: 110px;
  }
`;

const Share = ({ ready, onEnd }) => {
  const keywordsTitleAnimation = useAnimation();
  const keywordsAnimation = useAnimation();
  const thankyouAnimation = useAnimation();
  const shareButtonAnimation = useAnimation();

  const next = () => {
    if (!ready || !onEnd) {
      return;
    }

    onEnd();
  };

  useEffect(() => {
    if (!ready) {
      return;
    }

    keywordsTitleAnimation
      .start("fadeIn")
      .then(() => keywordsAnimation.start("listIn"))
      .then(() => thankyouAnimation.start("fadeIn"))
      .then(() =>
        shareButtonAnimation.start({
          scale: 1,
          transition: {
            duration: 0.3,
          },
        }),
      )
      .then(() => {
        shareButtonAnimation.start({
          scale: [null, 1.2],
          transition: {
            ease: "linear",
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          },
        });
      });
  }, [ready, keywordsAnimation, keywordsTitleAnimation, thankyouAnimation, shareButtonAnimation]);

  return (
    <Slide onClick={next}>
      <TopLeft>
        <TriangleSvg color="#f7eb52" size={180} />
      </TopLeft>
      <BottomRight>
        <TriangleSvg color="#0aad69" size={180} />
      </BottomRight>
      <BottomLeft>
        <PotatoSvg color="#00daff" size={150} />
      </BottomLeft>
      <TopRight>
        <PotatoSvg color="#5a59ff" size={150} />
      </TopRight>
      <Caption style={{ marginTop: "4rem", transform: "translate(0, 0)" }}>
        With all templates you have created
      </Caption>
      <H1 style={{ marginTop: "1rem" }}>
        You have saved <strong>37</strong> trees!
        <br />
        Thank you for helping save our mother Earth
      </H1>
      <TreeContainer>
        <img src={treePNG} alt="tree" />
      </TreeContainer>
      <H1
        style={{ marginTop: "7rem", opacity: 0 }}
        animate={keywordsTitleAnimation}
        variants={FADE_IN_OUT}
      >
        Your Keywords of the year:
      </H1>
      <FadeInList animate={keywordsAnimation}>
        <FadeInListItem custom={0}>
          <H1 style={{ marginBottom: "0.5rem", fontStyle: "normal" }}>
            <strong>#GoGreen</strong>
          </H1>
        </FadeInListItem>
        <FadeInListItem custom={1}>
          <H1 style={{ marginBottom: "0.5rem", fontStyle: "normal" }}>
            <strong>#CovidSafe</strong>
          </H1>
        </FadeInListItem>
        <FadeInListItem custom={1}>
          <H1 style={{ marginBottom: "0.5rem", fontStyle: "normal" }}>
            <strong>#iAuditorChampion</strong>
          </H1>
        </FadeInListItem>
      </FadeInList>
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <ShareButton animate={shareButtonAnimation} style={{ scale: 0 }}>
          <ShareSvg size={16} color="#FFF" />
          Share
        </ShareButton>
      </div>
    </Slide>
  );
};

export default Share;
