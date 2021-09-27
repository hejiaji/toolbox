import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

export const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2rem;
`;

export const H1 = styled(motion.h1)`
  line-height: 1.5;
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
`;

export const H2 = styled(motion.h2)`
  line-height: 1.5;
  font-weight: bold;
  font-size: 1.3rem;
  position: relative;
`;

export const List = styled(motion.ul)`
  font-size: 1rem;
  position: relative;
  list-style-type: none;
`;

export const ListItem = styled(motion.li)`
  margin-bottom: 0.5rem;
`;

export const Caption = styled(motion.div)`
  color: #737373;
  font-size: 0.85rem;
`;

const fadeInListVariants = {
  listIn: {
    opacity: 1,
  },
};

const fadeInListItemVariants = {
  listIn: (i) => ({
    opacity: 1,
    transition: {
      delay: i * 0.3,
    },
  }),
};

export const FadeInList = ({
  children,
  style = {},
  ...animationProps
}) => (
  <List
    style={{ ...style, opacity: 0 }}
    variants={fadeInListVariants}
    {...animationProps}
  >
    {children}
  </List>
);

export const FadeInListItem = ({
  children,
  style = {},
  custom,
  ...animationProps
}) => (
  <ListItem
    style={{ ...style, opacity: 0 }}
    custom={custom}
    variants={fadeInListItemVariants}
    {...animationProps}
  >
    {children}
  </ListItem>
);
