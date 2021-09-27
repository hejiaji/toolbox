import React, { Fragment, useEffect, useState } from "react";

import styled from "styled-components";

import { Slide, H1, FadeInList, FadeInListItem } from "./styles";
import { PotatoSvg } from "../../svgs/potato-svg";
import { SkullSvg } from "../../svgs/skull-svg";
import alarm from "../../svgs/alarm.png";
import hat from "../../svgs/hat.png";
import HorizontalMove from "../transitions/horizontal-move";
import { useTransitionController } from "../transitions/controller";
import { useAnimation } from "framer-motion";

const Top = styled.div`
  position: absolute;
  top: -9rem;
  left: -9rem;
  transform: rotate(31deg);
`;

const Bottom = styled.div`
  position: absolute;
  bottom: 5rem;
  right: -12rem;
  transform: rotate(103deg);
`;

const Item = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  img {
    width: 70px;
  }

  strong {
    font-size: 1.3rem;
    font-weight: bold;
    text-decoration: underline;
  }
`;

const Recommendations = ({ ready, onEnd }) => {
  const senceController = useTransitionController();
  const edAppAnimation = useAnimation();
  const [isSenceReady, setSenceReady] = useState(true);
  const [senceIndex, setSenceIndex] = useState(0);
  const maxSences = 2;

  useEffect(() => {
    if (!ready || senceIndex !== 1) {
      return;
    }

    edAppAnimation.start("listIn");
  }, [ready, senceIndex, edAppAnimation]);

  const next = () => {
    if (!ready || !onEnd || !isSenceReady) {
      return;
    }

    if (senceIndex + 1 >= maxSences) {
      onEnd();
    } else {
      setSenceReady(false);
      senceController.next().then(() => {
        setSenceIndex((prev) => prev + 1);
        setSenceReady(true);
      });
    }
  };

  return (
    <Slide onClick={next}>
      <Top>
        <PotatoSvg size={300} color="#8195f0" />
      </Top>
      <Bottom>
        <SkullSvg size={300} color="#0aad69" />
      </Bottom>
      <HorizontalMove controller={senceController} style={{ padding: "2rem" }}>
        <Fragment>
          <H1 style={{ marginTop: "10rem", textAlign: "center" }}>
            Discover how other teams like yours are using iAuditor
          </H1>
          <Item>
            <img src={alarm} alt="alarm" />
            <strong>Forklift check</strong>
          </Item>
          <Item>
            <img src={hat} alt="alarm" />
            <strong>Warehouse Management</strong>
          </Item>
        </Fragment>
        <Fragment>
          <FadeInList
            animate={edAppAnimation}
            style={{ textAlign: "right", marginTop: "3rem" }}
          >
            <FadeInListItem style={{ color: "#737373", fontSize: "0.875rem" }}>
              Within your org
            </FadeInListItem>
            <FadeInListItem style={{ marginTop: "2rem" }}>
              53 failed items have been created
            </FadeInListItem>
            <FadeInListItem>from Trolley Count Survey</FadeInListItem>
            <FadeInListItem style={{ marginTop: "2rem" }}>
              Interested in training?
            </FadeInListItem>
            <FadeInListItem style={{ whiteSpace: "nowrap" }}>
              Try our free training platform:{" "}
              <strong
                style={{ textDecoration: "underline", fontWeight: "bold" }}
              >
                EdAPP
              </strong>
            </FadeInListItem>
          </FadeInList>
          <FadeInList animate={edAppAnimation} style={{ marginTop: "10rem" }}>
            <FadeInListItem>A total of 1024 temperature checks</FadeInListItem>
            <FadeInListItem>
              have been carried out in the past year
            </FadeInListItem>
            <FadeInListItem style={{ marginTop: "2rem" }}>
              Want to do something a bit differently?
            </FadeInListItem>
            <FadeInListItem>
              Checkout what our{" "}
              <strong
                style={{ textDecoration: "underline", fontWeight: "bold" }}
              >
                IOT Devices
              </strong>{" "}
              can automate
            </FadeInListItem>
          </FadeInList>
        </Fragment>
      </HorizontalMove>
    </Slide>
  );
};

export default Recommendations;
