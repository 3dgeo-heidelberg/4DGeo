import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";

// Mock child components
jest.mock("../modules/visualisation/2DViewMap/View2D", () => () => <div>TestMapView</div>);
jest.mock("../modules/user-input/DateRangePicker", () => ({ dateRange, handleDateRangeChange, includedDates }) => (
    <button onClick={() => handleDateRangeChange({ startDate: 1, endDate: 2 })}>TestDateRangePicker</button>
));
jest.mock("../modules/user-input/ObservationSlider", () => ({ handleSliderRangeChange }) => (
    <button onClick={() => handleSliderRangeChange([1, 2])}>TestObservationSlider</button>
));
jest.mock("../modules/visualisation/Chart/Chart", () => ({ onBarClick }) => (
    <button onClick={() => onBarClick({}, 0)}>TestChart</button>
));

const layout = [
    { i: "Slider_1", x: 0, y: 0, w: 2, h: 2 },
    { i: "DateRangePicker_1", x: 2, y: 0, w: 2, h: 2 },
    { i: "Chart_1", x: 4, y: 0, w: 2, h: 2 },
    { i: "View2D_1", x: 6, y: 0, w: 2, h: 2 }
];

const observations = [
    { startDateTime: "2024-06-01T00:00:00Z" },
    { startDateTime: "2024-06-02T00:00:00Z" }
];

const typeColors = { type1: "#fff" };

describe("Dashboard", () => {
    let props;
    beforeEach(() => {
        props = {
            layout,
            observations,
            typeColors,
            dateRange: { startDate: Date.parse("2024-06-01T00:00:00Z"), endDate: Date.parse("2024-06-02T00:00:00Z") },
            setDateRange: jest.fn(),
            sliderRange: [Date.parse("2024-06-01T00:00:00Z")],
            setSliderRange: jest.fn(),
            dateTimeRange: { startDate: Date.parse("2024-06-01T00:00:00Z"), endDate: Date.parse("2024-06-02T00:00:00Z") },
            setDateTimeRange: jest.fn(),
            chartSelectedIndex: -1,
            setChartSelectedIndex: jest.fn(),
            setBoundingBox: jest.fn()
        };
    });

    test("renders all grid items", () => {
        render(<Dashboard {...props} />);
        expect(screen.getByText("Slider")).toBeInTheDocument();
        expect(screen.getByText("DateRangePicker")).toBeInTheDocument();
        expect(screen.getByText("Chart")).toBeInTheDocument();
        expect(screen.getByText("View2D")).toBeInTheDocument();
    });

    test("renders child components", () => {
        render(<Dashboard {...props} />);
        expect(screen.getByText("TestObservationSlider")).toBeInTheDocument();
        expect(screen.getByText("TestDateRangePicker")).toBeInTheDocument();
        expect(screen.getByText("TestChart")).toBeInTheDocument();
        expect(screen.getByText("TestMapView")).toBeInTheDocument();
    });

    test("renders fallback for unsupported module", () => {
        const badLayout = [{ i: "Unknown_1", x: 0, y: 0, w: 2, h: 2 }];
        render(<Dashboard {...props} layout={badLayout} />);
        expect(screen.getByText("Not a supported module name")).toBeInTheDocument();
    });
});