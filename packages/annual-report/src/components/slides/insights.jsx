import React, { Fragment, useState } from "react";

import styled from "styled-components"

import { Slide, H1, H2 } from "./styles";
import { PotatoSvg } from "../../svgs/potato-svg";
import { SkullSvg } from "../../svgs/skull-svg";
import yeah from "../../svgs/yeah.png";
import tie from "../../svgs/tie.png";
import mask from "../../svgs/mask.png";
import vehicle from "../../svgs/vehicle.png";
import { useTransitionController } from "../transitions/controller";
import HorizontalMove from "../transitions/horizontal-move";

const RightOuter = styled.div`
  position: absolute;
  right: -20rem;
  bottom: -8rem;
  transform: rotate(150deg);
`;

const RightInner = styled.div`
  position: absolute;
  bottom: -1rem;
  right: -19rem;
  transform: rotate(40deg);
`;

const UserCase = styled.div`
  display: flex;
  align-items: center;
  margin-top: -1rem;
  margin-left: -0.8rem;

  img {
    width: 100px;
  }

  strong {
    font-size: 1.3rem;
    font-weight: bold;
  }
`;

const Insights = ({ ready, onEnd }) => {
  const senceController = useTransitionController();
  const [isSenceReady, setSenceReady] = useState(true);
  const [senceIndex, setSenceIndex] = useState(0);
  const maxSences = 4;

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
      <RightOuter>
        <PotatoSvg size={500} color="#f7eb52" />
      </RightOuter>
      <RightInner>
        <SkullSvg size={400} color="#0aad69" />
      </RightInner>
      <HorizontalMove controller={senceController} style={{ padding: "2rem" }}>
        <Fragment>
          <H1 style={{ marginTop: "10rem" }}>
            <strong>Store Visit Check</strong> was your <strong>#1</strong>{" "}
            template
          </H1>
          <H1 style={{ marginTop: "5rem" }}>
            It has been audited <strong>29,831</strong> times with{" "}
            <strong>2,671</strong> actions created in the past year
          </H1>
        </Fragment>
        <Fragment>
          <div style={{ marginTop: "6rem", fontWeight: "bold" }}>
            <strong
              style={{
                fontSize: "1.7rem",
                fontStyle: "italic",
                marginRight: "0.5rem",
              }}
            >
              June
            </strong>
            <span style={{ fontSize: "1.3rem" }}>
              was <strong>your</strong> busiest month
            </span>
          </div>
          <H2 style={{ marginTop: "5rem" }}>
            <strong>17</strong> templates were created
          </H2>
          <H2 style={{ marginTop: "2rem" }}>
            <strong>131</strong> inspections were conducted with a completion
            rate of <strong>88%</strong>
          </H2>
          <H2 style={{ marginTop: "2rem" }}>
            <strong>3</strong> actions were raised and <strong>2</strong> were
            completed
          </H2>
        </Fragment>
        <Fragment>
          <div style={{ marginTop: "5rem" }}>
            <img src={yeah} alt="best-friend" width="120px" />
          </div>
          <H1 style={{ marginTop: "1rem" }}>
            <strong>Elvis</strong> was your closest companion in last year
          </H1>
          <H2 style={{ marginTop: "3rem" }}>
            You worked together on <strong>517</strong> inspections and{" "}
            <strong>3</strong> actions
          </H2>
        </Fragment>
        <Fragment>
          <H1 style={{ marginTop: "6rem" }}>
            The user cases that defined 2021 in your org
          </H1>
          <UserCase style={{ marginTop: "8rem" }}>
            <img src={vehicle} alt="vehicle" />
            <strong>Supply Chain Checklist</strong>
          </UserCase>
          <UserCase>
            <img src={mask} alt="mask" />
            <strong>Covid</strong>
          </UserCase>
          <UserCase>
            <img src={tie} alt="tie" />
            <strong>Manager site visit</strong>
          </UserCase>
        </Fragment>
      </HorizontalMove>
    </Slide>
  );
};

export default Insights;
