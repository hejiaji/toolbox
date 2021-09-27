import React, { useState, useEffect } from "react";
import { useAnimation } from "framer-motion";

import styled from "styled-components";

import { FADE_IN_OUT } from "../../constants/variants";
import { Slide, FadeInList, FadeInListItem, H1 } from "./styles";
import { SkullSvg } from "../../svgs/skull-svg";
import { PotatoSvg } from "../../svgs/potato-svg";

const Right = styled.div`
  position: absolute;
  right: -5rem;
  bottom: 15rem;
  transform: rotate(220deg);
`;

const Left = styled.div`
  position: absolute;
  left: -15rem;
  top: -10rem;
`;

const Summary = ({ ready, onEnd }) => {
  const personalListAnimation = useAnimation();
  const orgTitleAnimation = useAnimation();
  const orgListAnimation = useAnimation();
  const [isEnd, setEnd] = useState(false);

  useEffect(() => {
    if (!ready) {
      return;
    }

    personalListAnimation
      .start("listIn")
      .then(() => orgTitleAnimation.start("fadeIn"))
      .then(() => orgListAnimation.start("listIn"))
      .then(() => setEnd(true));
  }, [ready, personalListAnimation, orgTitleAnimation, orgListAnimation]);

  const next = () => {
    if (!ready || !isEnd || !onEnd) {
      return null;
    }

    onEnd();
  };

  return (
    <Slide onClick={next}>
      <Left>
        <PotatoSvg size={500} color="#f7eb52" />
      </Left>
      <Right>
        <SkullSvg size={180} color="#0aad69" />
      </Right>
      <H1 style={{ marginTop: "5rem", textAlign: "right" }}>In 2021</H1>
      <FadeInList
        style={{ textAlign: "right" }}
        animate={personalListAnimation}
      >
        <FadeInListItem custom={0}>
          You have created <strong>39</strong> templates
        </FadeInListItem>
        <FadeInListItem custom={1}>
          owned <strong>3,201</strong> inspections
        </FadeInListItem>
        <FadeInListItem custom={2}>
          raised <strong>3</strong> actions
        </FadeInListItem>
        <FadeInListItem
          custom={3}
          style={{
            fontSize: "0.8rem",
            color: "#737373",
            marginTop: "1rem",
            fontStyle: "italic",
          }}
        >
          You are the <strong>top 1</strong> template contributor in your org
        </FadeInListItem>
      </FadeInList>
      <H1
        style={{ marginTop: "10rem", opacity: 0 }}
        variants={FADE_IN_OUT}
        animate={orgTitleAnimation}
      >
        And in your org
      </H1>
      <FadeInList animate={orgListAnimation}>
        <FadeInListItem custom={0}>
          <strong>216</strong> templates
        </FadeInListItem>
        <FadeInListItem custom={1}>
          <strong>125,772</strong> inspections
        </FadeInListItem>
        <FadeInListItem custom={2}>
          <strong>3,808</strong> actions
        </FadeInListItem>
        <FadeInListItem custom={3}>
          <strong>2</strong> issues were created
        </FadeInListItem>
        <FadeInListItem
          style={{
            fontSize: "0.8rem",
            color: "#737373",
            marginTop: "1rem",
            fontStyle: "italic",
          }}
          custom={4}
        >
          which beats <strong>99.99%</strong> of the companies in your industry
        </FadeInListItem>
      </FadeInList>
    </Slide>
  );
};

export default Summary;
