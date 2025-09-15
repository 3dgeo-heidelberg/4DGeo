import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandingPage from './LandingPage';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('../components/dashboard-creation/DashboardCreation', () => () => <div data-testid="dashboard-creation" />);
jest.mock('../components/LandingPageHeader', () => ({ handleDrawerToggle, config }) => (
    <div data-testid="landing-page-header" />
));

function setup() {
    render(
        <LandingPage />
    );
}

describe('LandingPage tests', () => {
    // Mock fetch for config.json
    beforeEach(() => {
        global.fetch = jest.fn();
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                    APP_ICON: 'test-icon.png',
                    TEMPLATES: [
                        {
                            title: 'Template 1',
                            image: 'template1.png',
                            permalink: 'http://example.com/?state=' + btoa('layout=[]&url=test&interval=10&typeColors=[]')
                        }
                    ]
                }),
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('renders app icon and template list', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getAllByAltText('App-Logo')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Template 1')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Load from permalink')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Start from scratch')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Documentation')[0]).toBeInTheDocument();
        });
    });

    test('selects a template and populates dashboard', async () => {
        setup();
        await waitFor(() => screen.getAllByText('Template 1')[0]);
        fireEvent.click(screen.getAllByText('Template 1')[0]);
        expect(screen.getAllByTestId('dashboard-creation')[0]).toBeInTheDocument();
    });

    test('opens and closes permalink dialog', async () => {
        setup();
        await waitFor(() => screen.getAllByText('Load from permalink')[0]);
        fireEvent.click(screen.getAllByText('Load from permalink')[0]);
        expect(screen.getAllByLabelText('Permalink')[0]).toBeInTheDocument();
        fireEvent.click(screen.getAllByText('Load')[0]);
        await waitFor(() => expect(screen.queryByLabelText('Permalink')).not.toBeInTheDocument());
    });

    test('shows error for invalid permalink', async () => {
        setup();
        await waitFor(() => screen.getAllByText('Load from permalink')[0]);
        fireEvent.click(screen.getAllByText('Load from permalink')[0]);
        const input = screen.getAllByLabelText('Permalink')[0];
        fireEvent.change(input, { target: { value: 'invalid-url' } });
        fireEvent.click(screen.getAllByText('Load')[0]);
        expect(screen.getAllByText('Invalid permalink format.')[0]).toBeInTheDocument();
    });

    test('start from scratch resets dashboard', async () => {
        setup();
        await waitFor(() => screen.getAllByText('Start from scratch')[0]);
        fireEvent.click(screen.getAllByText('Start from scratch')[0]);
        expect(screen.getAllByTestId('dashboard-creation')[0]).toBeInTheDocument();
    });

    test('documentation button has correct href', async () => {
        setup();
        await waitFor(() => screen.getAllByText('Documentation'))[0];
        const docButton = screen.getAllByText('Documentation')[0];
        expect(docButton.closest('a')).toHaveAttribute('href', expect.stringContaining('/docs'));
    });
});