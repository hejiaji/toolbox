import React from "react";

const DEFAULT_SIZE = 21;

export class Svg extends React.PureComponent {
    render() {
        const { size, color } = this.props;
        return (
            this.renderSvg(
                size || DEFAULT_SIZE,
                color || "#006ed5",
            )
        );
    }
}