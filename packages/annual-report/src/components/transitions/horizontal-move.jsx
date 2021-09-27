import React, {
  useState,
} from "react";
import { motion, useAnimation } from "framer-motion";

import styled from "styled-components";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const Sence = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const senceVariants = {
  senceOut: {
    x: "-100%",
    transition: {
      ease: "easeOut",
      duration: 0.5,
    },
  },
  senceIn: {
    x: "0",
    transition: {
      ease: "easeOut",
      duration: 0.5,
    },
  },
};

const HorizontalMove = ({
  children,
  style,
  controller,
  onClick,
}) => {
  const [activeSence, setActiveSence] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [clearInactive, setClearInactive] = useState(false);
  const frontAnimation = useAnimation();
  const backAnimation = useAnimation();
  const isFrontActive = activeSence === 0;
  const isLastSence = activeIndex + 1 >= children.length;

  controller.next = () => {
    if (isLastSence) {
      return Promise.reject("out of sence range");
    }

    return Promise.all([
      frontAnimation.start(isFrontActive ? "senceOut" : "senceIn"),
      backAnimation.start(isFrontActive ? "senceIn" : "senceOut"),
    ]).then(() => {
      setActiveIndex((prev) => prev + 1);
      setActiveSence(isFrontActive ? 1 : 0);
      setClearInactive(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setClearInactive(false);
          resolve();
        }, 0);
      });
    });
  };

  const child = children[activeIndex];

  return (
    <Container onClick={onClick}>
      {(isFrontActive || !clearInactive) && (
        <Sence
          style={{
            ...style,
            transform: isFrontActive ? "none" : "translateX(100%)",
          }}
          animate={frontAnimation}
          variants={senceVariants}
        >
          {isFrontActive
            ? child
            : isLastSence
            ? null
            : children[activeIndex + 1]}
        </Sence>
      )}
      {(!isFrontActive || !clearInactive) && (
        <Sence
          style={{
            ...style,
            transform: !isFrontActive ? "none" : "translateX(100%)",
          }}
          animate={backAnimation}
          variants={senceVariants}
        >
          {!isFrontActive
            ? child
            : isLastSence
            ? null
            : children[activeIndex + 1]}
        </Sence>
      )}
    </Container>
  );
};

export default HorizontalMove;
