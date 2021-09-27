import * as React from "react";
import { Svg } from "./svg";

export class TriangleSvg extends Svg {
  renderSvg(size, color) {
    const { style, className } = this.props;
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={style}
        className={className}
        focusable="false"
      >
        <path
          fill={color}
          className="SQ2ADw _682gpw"
          d="M500,602.9381221042318H0V0L500,602.9381221042318z"
        />
      </svg>
    );
  }
}
