import React from 'react';
import { render, screen, fireEvent, waitFor, findByTestId } from '@testing-library/react';
import Chart from './Chart';
import userEvent from '@testing-library/user-event';

const mockObservations = [
    {
        startDateTime: '2024-06-01T10:00:00Z',
        geoObjects: [
            { type: 'A', customAttributes: { attr1: 10, attr2: 5 } },
            { type: 'B', customAttributes: { attr1: 20 } },
            { type: 'A', customAttributes: { attr1: 15, attr2: 7 } },
        ],
    },
    {
        startDateTime: '2024-06-02T12:00:00Z',
        geoObjects: [
            { type: 'A', customAttributes: { attr1: 5 } },
            { type: 'B', customAttributes: { attr1: 30, attr2: 8 } },
        ],
    },
];

const mockTypeColors = new Map([
    ['A', '#ff0000'],
    ['B', '#00ff00'],
]);

beforeEach(() => {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
    }))
})

describe('Chart', () => {
    it('renders operator and field selectors', () => {
        render(<Chart observations={mockObservations} typeColors={mockTypeColors} />);
        expect(screen.getByLabelText(/Operator/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Field/i)).toBeInTheDocument();
    });

    it('renders custom data fields in field selector', () => {
        render(<Chart observations={mockObservations} typeColors={mockTypeColors} />);
        fireEvent.mouseDown(screen.getByLabelText(/Field/i));
        expect(screen.getByText('attr1')).toBeInTheDocument();
        expect(screen.getByText('attr2')).toBeInTheDocument();
    });

    // it('renders BarChart when valid field and operator are selected', async () => {
    //     const container = render(<Chart observations={mockObservations} typeColors={mockTypeColors} />);

    //     const user = userEvent.setup();

    //     // dropdown
    //     const selectButton = container.getByLabelText("Field");
    //     await user.click(selectButton);

    //     const option = screen.getByText("attr1");
    //     console.log("vor click", container.getByText("attr1"))

    //     await user.click(option);

    //     const chart = await container.findBy("bar-chart");
    //     console.log("chart!!!!!!!!!!!", chart);

    //     expect(chart).toBeInTheDocument();
    // });

    it('does not render BarChart if no observations', () => {
        render(<Chart observations={[]} typeColors={mockTypeColors} />);
        expect(screen.queryByText(/Legend/i)).not.toBeInTheDocument();
    });
});