import React from "react";

/**
 * Lightweight horizontal bar chart — no external dependencies.
 *
 * Props:
 *   data: [{ label, value, color?, maxValue? }]
 *   height: bar height in px (default 22)
 *   formatValue: (value) => string (default: percentage)
 */
const BarChart = ({ data = [], height = 22, formatValue }) => {
    const max = data.reduce((m, d) => Math.max(m, d.maxValue ?? d.value), 0);
    if (max === 0) return null;

    const fmt = formatValue || ((v) => `${Math.round(v * 100)}%`);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", width: "100%" }}>
            {data.map((d, i) => {
                const pct = ((d.value / max) * 100).toFixed(1);
                return (
                    <div key={i}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                                marginBottom: 2,
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>{d.label}</span>
                            <span style={{ color: "#888" }}>{fmt(d.value)}</span>
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height,
                                borderRadius: height / 2,
                                background: "rgba(15,23,42,0.06)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${pct}%`,
                                    height: "100%",
                                    borderRadius: height / 2,
                                    background: d.color || "#1890ff",
                                    transition: "width 0.4s ease",
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BarChart;
