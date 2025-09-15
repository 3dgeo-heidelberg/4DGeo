import React from 'react';
import { render, screen } from '@testing-library/react';
import View2D from './View2D';

// Mock leaflet and react-leaflet dependencies
jest.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    LayersControl: ({ children }) => <div data-testid="layers-control">{children}</div>,
    LayerGroup: (props, ref) => <div data-testid="layer-group" ref={ref}>{props.children}</div>
}));

jest.mock('react-leaflet-markercluster/styles', () => ({}));

jest.mock('leaflet', () => {
    const actual = jest.requireActual('leaflet');
    return {
        ...actual,
        CRS: { Simple: 'CRS.Simple' },
        Icon: { Default: { prototype: {}, mergeOptions: jest.fn() } },
        markerClusterGroup: jest.fn(() => ({ addLayer: jest.fn(), clearLayers: jest.fn() })),
        deflate: jest.fn(() => ({ addTo: jest.fn() })),
        Polygon: function () { this.bindTooltip = jest.fn(() => this); this.addTo = jest.fn(() => this); this.getBounds = jest.fn(() => ({ getCenter: () => [0, 0] })); },
        Polyline: function () { this.bindTooltip = jest.fn(() => this); this.addTo = jest.fn(() => this); this.getBounds = jest.fn(() => ({ getCenter: () => [0, 0] })); },
        circle: jest.fn(() => ({ bindTooltip: jest.fn(() => ({ addTo: jest.fn() })), addTo: jest.fn() })),
        rectangle: jest.fn(() => ({ bindTooltip: jest.fn(() => ({ addTo: jest.fn() })), addTo: jest.fn() }))
    };
});
jest.mock('./BackgroundImage', () => ({ backgroundImageData, setBoundingBox }) => (
    <div data-testid="background-image">{backgroundImageData && 'Background'}</div>
));

const typeColors = new Map([['testType', 'red']]);

describe('View2D', () => {
    it('renders "Map is not available." when no backgroundImageData', () => {
        render(<View2D observations={[]} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByText(/Map is not available/i)).toBeInTheDocument();
    });

    it('renders MapContainer when backgroundImageData is present', () => {
        const observations = [{
            backgroundImageData: { width: 100, height: 200 },
            geoObjects: []
        }];
        render(<View2D observations={observations} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByTestId('background-image')).toBeInTheDocument();
        expect(screen.getByTestId('layers-control')).toBeInTheDocument();
    });

    it('renders geoObjects of type Polygon', () => {
        const observations = [{
            backgroundImageData: { width: 100, height: 200 },
            geoObjects: [{
                type: 'testType',
                geometry: { type: 'Polygon', coordinates: [[[0,0],[1,1],[2,2]]] },
                customAttributes: { attr1: 'value1' }
            }]
        }];
        render(<View2D observations={observations} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders geoObjects of type Point', () => {
        const observations = [{
            backgroundImageData: { width: 100, height: 200 },
            geoObjects: [{
                type: 'testType',
                geometry: { type: 'Point', coordinates: [1,2] },
                customAttributes: { attr2: 'value2' }
            }]
        }];
        render(<View2D observations={observations} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders geoObjects of type Rectangle', () => {
        const observations = [{
            backgroundImageData: { width: 100, height: 200 },
            geoObjects: [{
                type: 'testType',
                geometry: { type: 'Rectangle', coordinates: [[0,0],[1,1]] },
                customAttributes: { attr3: 'value3' }
            }]
        }];
        render(<View2D observations={observations} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders geoObjects of type LineString', () => {
        const observations = [{
            backgroundImageData: { width: 100, height: 200 },
            geoObjects: [{
                type: 'testType',
                geometry: { type: 'LineString', coordinates: [[0,0],[1,1]] },
                customAttributes: { attr4: 'value4' }
            }]
        }];
        render(<View2D observations={observations} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('handles unknown geoObject geometry type gracefully', () => {
        const observations = [{
            backgroundImageData: { width: 100, height: 200 },
            geoObjects: [{
                type: 'testType',
                geometry: { type: 'UnknownType', coordinates: [] }
            }]
        }];
        render(<View2D observations={observations} typeColors={typeColors} setBoundingBox={jest.fn()} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
});