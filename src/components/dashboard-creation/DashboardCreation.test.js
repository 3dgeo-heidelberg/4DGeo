import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardCreation from './DashboardCreation';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    createSearchParams: (params) => new URLSearchParams(params),
    useHref: () => '/',
}));
jest.mock('../../utils/http_fetcher', () => ({
    fetchJsonData: jest.fn(),
}));
jest.mock('./ColorAssignment', () => () => <div data-testid="color-assignment" />);

describe('DashboardCreation', () => {
    const defaultProps = {
        layout: [],
        setLayout: jest.fn(),
        url: '',
        setUrl: jest.fn(),
        interval: '',
        setInterval: jest.fn(),
        typeColors: new Map(),
        setTypeColors: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders headline and input fields', () => {
        render(<DashboardCreation {...defaultProps} />);
        expect(screen.getByText(/Customize your Dashboard/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Link to your data source/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Refresh Interval - seconds/i)).toBeInTheDocument();
    });

    it('renders Add Module button and menu', () => {
        render(<DashboardCreation {...defaultProps} />);
        const addButton = screen.getByText("Add Module");
        expect(addButton).toBeInTheDocument();

        fireEvent.click(addButton);
        expect(screen.getByText('2D View')).toBeInTheDocument();
        expect(screen.getByText('Chart')).toBeInTheDocument();
        expect(screen.getByText('DateRangePicker')).toBeInTheDocument();
        expect(screen.getByText('Slider')).toBeInTheDocument();
    });

    it('renders Permalink and Go buttons', () => {
        render(<DashboardCreation {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Permalink/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Go/i })).toBeInTheDocument();
    });

    it('renders ColorAssignment component', () => {
        render(<DashboardCreation {...defaultProps} />);
        expect(screen.getByTestId('color-assignment')).toBeInTheDocument();
    });

    it('calls setUrl and setInterval on input change', () => {
        render(<DashboardCreation {...defaultProps} />);
        fireEvent.change(screen.getByLabelText(/Link to your data source/i), { target: { value: 'http://test.com' } });
        expect(defaultProps.setUrl).toHaveBeenCalledWith('http://test.com');

        fireEvent.change(screen.getByLabelText(/Refresh Interval - seconds/i), { target: { value: '30' } });
        expect(defaultProps.setInterval).toHaveBeenCalledWith('30');
    });

    it('shows snackbar when Permalink button is clicked', async () => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });
        render(<DashboardCreation {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Permalink/i }));
        await waitFor(() => {
            expect(screen.getByText(/Permalink copied to your clipboard/i)).toBeInTheDocument();
        });
    });
});