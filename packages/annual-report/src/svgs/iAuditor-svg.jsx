import * as React from "react";
import { Svg } from "./svg";

export class IAuditorMarkOnly extends Svg {
    renderSvg(size) {
        const { style, className } = this.props;
        return (
            <svg
                viewBox="0 0 68 67"
                width={size}
                height={size}
                style={style}
                className={className}
                focusable="false"
            >
                <g fill="none" fillRule="evenodd">
                    <g fillRule="nonzero">
                        <g transform="translate(.855)">
                            <path
                                d="M29.218 65.155a4.847 4.847 0 0 0 6.54.288l.025-.024c.1-.084.198-.17.292-.264.094-.094.18-.193.264-.292l28.526-28.526c.1-.085.199-.17.293-.264a4.846 4.846 0 0 0-6.609-7.082l-.012-.012-29.621 29.622-3.126 3.126 3.428 3.428z"
                                id="Path"
                                fill="#00DAFF"
                            />
                            <path
                                d="M15.384 51.32L25.79 61.728l6.857-6.857L22.24 44.464a4.849 4.849 0 0 0-6.857 6.857z"
                                id="Path"
                                fill="#5A59FF"
                            />
                            <path
                                d="M37.36 1.419a4.847 4.847 0 0 0-6.538-.288h-.002l-.024.024c-.1.084-.198.17-.292.264a4.86 4.86 0 0 0-.265.292L1.714 30.237c-.1.085-.199.17-.293.264a4.846 4.846 0 0 0 6.609 7.082l.012.012L37.663 7.973l3.126-3.126-3.428-3.428z"
                                id="Path"
                                fill="#FFD701"
                            />
                            <path
                                d="M51.195 15.253L40.789 4.847l-6.857 6.857L44.338 22.11a4.849 4.849 0 0 0 6.857-6.857z"
                                id="Path"
                                fill="#0AAD69"
                            />
                        </g>
                    </g>
                </g>
            </svg>
        );
    }
}
