// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrendChart } from "./TrendChart";

describe("TrendChart Component", () => {
  it("renders empty state gracefully when data is empty", () => {
    render(
      <TrendChart
        title="Progreso de Carga"
        data={[]}
        type="line"
        emptyMessage="Sin registros para este periodo"
      />
    );
    expect(screen.getByText("Progreso de Carga")).toBeDefined();
    expect(screen.getByText("Sin registros para este periodo")).toBeDefined();
  });

  it("renders a line chart with points and path", () => {
    const data = [
      { label: "12 Oct", value: 50 },
      { label: "19 Oct", value: 55 },
      { label: "26 Oct", value: 60 },
    ];

    const { container } = render(
      <TrendChart
        title="Evolución de Carga (kg)"
        data={data}
        type="line"
        unit="kg"
      />
    );

    expect(screen.getByText("Evolución de Carga (kg)")).toBeDefined();
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    // Check SVG line path exists
    const path = container.querySelector("path.trend-line-path");
    expect(path).not.toBeNull();

    // Check points exist
    const points = container.querySelectorAll("circle.trend-point");
    expect(points.length).toBe(3);
  });

  it("renders bar chart with correct number of bars", () => {
    const data = [
      { label: "Sem 1", value: 1200 },
      { label: "Sem 2", value: 1500 },
      { label: "Sem 3", value: 1800 },
    ];

    const { container } = render(
      <TrendChart
        title="Volumen Semanal (kg)"
        data={data}
        type="bar"
        unit="kg"
      />
    );

    const bars = container.querySelectorAll("rect.trend-bar");
    expect(bars.length).toBe(3);
  });

  it("displays tooltip on point or bar interaction", () => {
    const data = [
      { label: "Sem 1", value: 1200 },
      { label: "Sem 2", value: 1500 },
    ];

    const { container } = render(
      <TrendChart
        title="Volumen Semanal"
        data={data}
        type="bar"
        unit="kg"
      />
    );

    const bars = container.querySelectorAll("rect.trend-bar");
    expect(bars.length).toBe(2);

    // Hover or click first bar
    fireEvent.mouseEnter(bars[0]);
    expect(screen.getByText(/1[.,]200 kg/)).toBeDefined();
  });

  it("renders horizontal bars for limiter distributions", () => {
    const data = [
      { label: "Fallo muscular", value: 5, secondary: "50%" },
      { label: "Carga alta", value: 3, secondary: "30%" },
      { label: "Molestia articular", value: 2, secondary: "20%", isAlert: true },
    ];

    const { container } = render(
      <TrendChart
        title="Factores Limitantes"
        data={data}
        type="horizontal-bar"
      />
    );

    expect(screen.getByText("Fallo muscular")).toBeDefined();
    expect(screen.getByText("Carga alta")).toBeDefined();
    expect(screen.getByText("Molestia articular")).toBeDefined();

    const hBars = container.querySelectorAll(".trend-hbar-fill");
    expect(hBars.length).toBe(3);
  });
});
