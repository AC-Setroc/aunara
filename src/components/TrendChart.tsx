import React, { useState } from "react";

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: string;
  isAlert?: boolean;
  tooltipText?: string;
}

export interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  type: "line" | "bar" | "horizontal-bar";
  unit?: string;
  emptyMessage?: string;
  height?: number;
}

export function TrendChart({
  title,
  subtitle,
  data,
  type,
  unit = "",
  emptyMessage = "Sin registros suficientes para graficar",
  height = 220,
}: TrendChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const formatValue = (num: number) => {
    return num.toLocaleString();
  };

  if (!data || data.length === 0) {
    return (
      <div className="bi-chart-card empty-chart" style={{ minHeight: height }}>
        <div className="bi-chart-header">
          <h4 className="bi-chart-title">{title}</h4>
          {subtitle && <p className="bi-chart-subtitle">{subtitle}</p>}
        </div>
        <div className="bi-chart-empty-body">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Horizontal Bar Chart Render (DOM + Flex/CSS bars)
  if (type === "horizontal-bar") {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
      <div className="bi-chart-card" style={{ minHeight: height }}>
        <div className="bi-chart-header">
          <h4 className="bi-chart-title">{title}</h4>
          {subtitle && <p className="bi-chart-subtitle">{subtitle}</p>}
        </div>

        <div className="bi-hbars-container" role="img" aria-label={title}>
          {data.map((item, idx) => {
            const percent = Math.min(100, Math.round((item.value / maxValue) * 100));
            const isAlert = Boolean(item.isAlert);

            return (
              <div
                key={item.label || idx}
                className={`bi-hbar-row ${isAlert ? "is-alert" : ""}`}
                onClick={() => setSelectedIndex(idx === selectedIndex ? null : idx)}
              >
                <div className="bi-hbar-labels">
                  <span className="bi-hbar-title">{item.label}</span>
                  <span className="bi-hbar-value">
                    {formatValue(item.value)} {unit}
                    {item.secondary ? ` (${item.secondary})` : ""}
                  </span>
                </div>
                <div className="bi-hbar-track">
                  <div
                    className={`trend-hbar-fill ${isAlert ? "alert-fill" : ""}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // SVG dimensions for Line and Vertical Bar Charts
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 10);
  const range = maxVal - minVal || 1;

  // Grid tick lines
  const gridTicks = [0, 0.5, 1];

  const getX = (idx: number) => {
    if (data.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / range;
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Construct Line Path
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    data: d,
    idx: i,
  }));

  const linePathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Gradient area underneath
  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  const activeItem = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <div className="bi-chart-card" style={{ minHeight: height }}>
      <div className="bi-chart-header">
        <div>
          <h4 className="bi-chart-title">{title}</h4>
          {subtitle && <p className="bi-chart-subtitle">{subtitle}</p>}
        </div>
        {activeItem && (
          <div className="bi-chart-active-badge">
            <strong>{activeItem.label}:</strong> {formatValue(activeItem.value)} {unit}
          </div>
        )}
      </div>

      <div className="bi-chart-svg-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="bi-trend-svg"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D5BFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2D5BFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridTicks.map((ratio) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const labelVal = Math.round(minVal + range * ratio);
            return (
              <g key={ratio} className="bi-grid-tick">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#DCE0E6"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#5A6473"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="inherit"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Bar Chart Representation */}
          {type === "bar" && (() => {
            const barWidth = Math.max(12, Math.min(36, (chartWidth / data.length) * 0.6));
            return data.map((d, i) => {
              const xCenter = paddingLeft + (i + 0.5) * (chartWidth / data.length);
              const barX = xCenter - barWidth / 2;
              const barY = getY(d.value);
              const barH = Math.max(2, paddingTop + chartHeight - barY);
              const isSelected = selectedIndex === i;

              return (
                <g
                  key={d.label || i}
                  className="trend-bar-group"
                  onMouseEnter={() => setSelectedIndex(i)}
                  onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    className="trend-bar"
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barH}
                    rx="4"
                    fill={isSelected ? "#12151B" : "#2D5BFF"}
                    opacity={isSelected ? 1 : 0.85}
                  />
                  <text
                    x={xCenter}
                    y={svgHeight - 12}
                    fill="#5A6473"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="inherit"
                  >
                    {d.label}
                  </text>
                </g>
              );
            });
          })()}

          {/* Line Chart Representation */}
          {type === "line" && (
            <>
              {areaPathD && (
                <path
                  d={areaPathD}
                  fill={`url(#gradient-${title.replace(/\s+/g, "-")})`}
                />
              )}
              <path
                className="trend-line-path"
                d={linePathD}
                fill="none"
                stroke="#2D5BFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((pt) => {
                const isSelected = selectedIndex === pt.idx;
                return (
                  <g
                    key={pt.idx}
                    className="trend-point-group"
                    onMouseEnter={() => setSelectedIndex(pt.idx)}
                    onClick={() => setSelectedIndex(pt.idx === selectedIndex ? null : pt.idx)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      className="trend-point"
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? "#12151B" : "#2D5BFF"}
                      stroke="#FAFAF8"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      fill="#5A6473"
                      fontSize="11"
                      textAnchor="middle"
                      fontFamily="inherit"
                    >
                      {pt.data.label}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
