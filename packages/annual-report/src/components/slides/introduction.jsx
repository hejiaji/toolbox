import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";

import styled from "styled-components";

import { Slide } from "./styles";
import { FADE_IN_OUT } from "../../constants/variants";
import { TriangleSvg } from "../../svgs/triangle-svg";
import { PotatoSvg } from "../../svgs/potato-svg";

const Title = styled(motion.div)`
  position: absolute;
  top: 35%;
  left: 0;
  right: 0;
  font-weight: bold;
  font-size: 3rem;
  display: flex;
  justify-content: center;
`;

const URL = styled(motion.div)`
  position: absolute;
  bottom: 30%;
  left: 0;
  right: 0;
  font-size: 1.5rem;
  text-align: center;
  font-style: italic;
`;

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

const Content = styled(motion.div)`
  position: absolute;
  top: 25%;
  left: 3rem;
  right: 3rem;
  opacity: 0;

  p {
    margin-bottom: 1.5rem;
    line-height: 2rem;
    font-size: 1.5rem;
  }
`;

const Introduction = ({
  ready,
  onTitleEnd,
  onEnd = () => {},
}) => {
  const titleAnimation = useAnimation();
  const contentAnimation = useAnimation();
  const [isAnimation, setAnimation] = useState(false);
  const [step, setStep] = useState(0);
  const addStep = () => setStep((prev) => prev + 1);
  const maxStep = 1;

  const next = () => {
    if (!ready || isAnimation) {
      return;
    }

    if (step >= maxStep) {
      onEnd();
      return;
    }

    setAnimation(true);
    onTitleEnd();
    Promise.all([
      titleAnimation.start("fadeOut"),
      contentAnimation.start("fadeIn"),
    ]).then(() => {
      setAnimation(false);
      addStep();
    });
  };

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
      <Title animate={titleAnimation} variants={FADE_IN_OUT}>
        <div>
          YOUR 2021 <br /> WITH <br /> IAUDITOR
        </div>
      </Title>
      <URL animate={titleAnimation} variants={FADE_IN_OUT}>
        https://safetyculture.com
      </URL>
      <Content animate={contentAnimation} variants={FADE_IN_OUT}>
        <p>
          Hi <strong>Jessie</strong>
        </p>
        <p>
          You joined iAuditor since <br />
          <strong>20, Apr, 2018</strong>
        </p>
        <p style={{ marginTop: "8rem" }}>
          In the blink of an eye, it's already been <strong>522</strong> days
          since we first met.{" "}
        </p>
      </Content>
    </Slide>
  );
};

export default Introduction;
