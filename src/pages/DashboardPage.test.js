import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './DashboardPage';
import * as httpFetcher from '../utils/http_fetcher';
import { BrowserRouter } from 'react-router-dom';

// // Mock dependencies
jest.mock('../components/dashboard/Dashboard', () => () => <div data-testid="dashboard-component" />);
jest.mock('../components/dashboard-creation/ColorAssignment', () => () => <button>Assign Colors</button>);
jest.mock('../components/dashboard/ExportButton', () => () => <button>Export by map extent</button>);
jest.mock('../components/dashboard/UploadButton', () => () => <button>Upload data</button>);
jest.mock('../utils/http_fetcher', () => ({
    fetchJsonData: jest.fn(),
}));

function setup(searchParams = {}) {
    // Mock useSearchParams
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
        {
            get: (key) => {
                if (key === 'state') {
                    // encode a URLSearchParams string
                    const params = new URLSearchParams({
                        url: 'test-url',
                        layout: JSON.stringify({}),
                        typeColors: JSON.stringify([]),
                        interval: searchParams.interval || null,
                    });
                    return btoa(params.toString());
                }
                return null;
            },
        },
    ]);
    return render(
        <BrowserRouter>
            <DashboardPage />
        </BrowserRouter>
    );
}

describe('DashboardPage', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ APP_NAME: 'TestApp', APP_ICON: 'test-icon.png' }),
        });
    })

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('renders logo, buttons and dashboard', async () => {
        httpFetcher.fetchJsonData.mockResolvedValue({
            observations: [
                {
                    startDateTime: '2024-06-01T00:00:00Z',
                    geoObjects: [{ type: 'A' }],
                },
            ],
        });

        setup()

        await waitFor(() => {
            expect(screen.getByAltText('App-Logo')).toBeInTheDocument();
            expect(screen.getByTestId("dashboard-component"))
            expect(screen.getByText('Assign Colors')).toBeInTheDocument();
            expect(screen.getByText('Export by map extent')).toBeInTheDocument();
            expect(screen.getByText('Upload data')).toBeInTheDocument();
        });
    });

    test('loads observations and sets type colors', async () => {
        httpFetcher.fetchJsonData.mockResolvedValue({
            observations: [
                {
                    startDateTime: '2024-06-01T00:00:00Z',
                    geoObjects: [{ type: 'A' }, { type: 'B' }],
                },
                {
                    startDateTime: '2024-06-02T00:00:00Z',
                    geoObjects: [{ type: 'B' }],
                },
            ],
        });

        setup();

        await waitFor(() => {
            expect(httpFetcher.fetchJsonData).toHaveBeenCalledWith('test-url');
            expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
        });
    });

    test('handles empty observations', async () => {
        httpFetcher.fetchJsonData.mockResolvedValue(null);

        setup();

        await waitFor(() => {
            expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
        });
    });

    test('sets up interval reload if interval param is present', async () => {
        jest.useFakeTimers();
        httpFetcher.fetchJsonData.mockResolvedValue({
            observations: [
                {
                    startDateTime: '2024-06-01T00:00:00Z',
                    geoObjects: [{ type: 'A' }],
                },
            ],
        });

        setup({ interval: '1' });

        await waitFor(() => {
            expect(httpFetcher.fetchJsonData).toHaveBeenCalledTimes(1);
        });

        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(httpFetcher.fetchJsonData).toHaveBeenCalledTimes(2);
        });

        jest.useRealTimers();
    });
})