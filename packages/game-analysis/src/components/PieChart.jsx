import React from "react";

/**
 * Lightweight SVG pie chart — no external dependencies.
 *
 * Props:
 *   data: [{ label, value, color }]
 *   size: number (default 180)
 */
const PieChart = ({ data = [], size = 180 }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return null;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 4;

    let cumulative = 0;
    const slices = data
        .filter((d) => d.value > 0)
        .map((d) => {
            const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
            cumulative += d.value;
            const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
            const largeArc = d.value / total > 0.5 ? 1 : 0;

            const x1 = cx + radius * Math.cos(startAngle);
            const y1 = cy + radius * Math.sin(startAngle);
            const x2 = cx + radius * Math.cos(endAngle);
            const y2 = cy + radius * Math.sin(endAngle);

            // For a single 100% slice, draw a full circle
            if (data.filter((dd) => dd.value > 0).length === 1) {
                return {
                    ...d,
                    path: null,
                    fullCircle: true,
                };
            }

            const path = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                "Z",
            ].join(" ");

            return { ...d, path, fullCircle: false };
        });

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((s, i) =>
                    s.fullCircle ? (
                        <circle key={i} cx={cx} cy={cy} r={radius} fill={s.color} />
                    ) : (
                        <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
                    )
                )}
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {data
                    .filter((d) => d.value > 0)
                    .map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                            <span
                                style={{
                                    display: "inline-block",
                                    width: 12,
                                    height: 12,
                                    borderRadius: 3,
                                    background: d.color,
                                }}
                            />
                            <span>{d.label}</span>
                            <span style={{ color: "#999" }}>
                                {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PieChart;
