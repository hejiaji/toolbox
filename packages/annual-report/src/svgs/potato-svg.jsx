import * as React from "react";
import { Svg } from "./svg";

export class PotatoSvg extends Svg {
  renderSvg(size, color) {
    const { style, className } = this.props;
    return (
      <svg
        viewBox="0 -2.5 483 500"
        width={size}
        height={size}
        style={style}
        className={className}
        focusable="false"
      >
        <path
          d="M477.2,235.6c-9.5-49.9-37.2-93.7-68.9-132.6c-28-34.3-61.2-65-101.3-84.5C287.6,9,265.7,0.3,244-0.9   c-21.6-1.2-43.4,3.1-63.2,11.8c-20.1,8.7-38.4,22.3-52.1,39.3c-15.6,19.2-24.3,42.3-33.4,65.1c-20.6,51.8-52.2,98.2-73.2,150   c-18.6,45.8-27.7,98-8.7,145.4c18.2,45.2,60.6,71.2,107.2,80c53.3,9.9,108.4-0.9,158-21.4c24.9-10.2,48.7-22.9,71.9-36.6   c22.9-13.6,45.9-27.5,67.3-43.3c19.4-14.3,36.4-31.2,47.1-53c10.2-20.7,15.1-43.9,15.3-67C480.3,257.9,479.1,246.6,477.2,235.6"
          fill={color}
        />
      </svg>
    );
  }
}
