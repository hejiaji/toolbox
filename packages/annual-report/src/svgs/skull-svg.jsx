import * as React from "react";
import { Svg } from "./svg";

export class SkullSvg extends Svg {
  renderSvg(size, color) {
    const { style, className } = this.props;
    return (
      <svg
        viewBox="0 0 119.8 153.5"
        width={size}
        height={size}
        style={style}
        className={className}
        focusable="false"
      >
        <path
          d="m4.6 30.8c-13 20.6 5.3 25.3 10 43.9 5 19.4-10.6 39.4 1.6 57.5 29.3 43.6 90.3 13.5 100.9-27.9 2.1-8.3 4.7-19.5 0-27.6-6.1-10.7-19.9-7.5-23.5-12.7-7.4-10.8 0.6-19.5-5.4-32.8-4-9-14.4-2.2-19.1-6.4-7.1-6.4-3.3-16.9-13.4-22.2-19.4-10.4-41.5 12.9-51.1 28.2z"
          fill={color}
        />
      </svg>
    );
  }
}
