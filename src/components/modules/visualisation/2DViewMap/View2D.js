import { MapContainer, LayersControl, LayerGroup } from "react-leaflet"; // Import Leaflet components for rendering the map and layers
import L from "leaflet"; // Import Leaflet library to access its utility methods

import "leaflet/dist/leaflet.css";
import 'react-leaflet-markercluster/styles'
import { useRef } from "react";
import 'leaflet.markercluster';
import 'Leaflet.Deflate'
import BackgroundImage from "./BackgroundImage";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


export default function View2D({ 
    observations,
    typeColors,
    setBoundingBox
 }) {
    const clusteredLayer = useRef(null);
    const normalLayer = useRef(null);

    let backgroundImageData = null;
    if(observations.find(observation => observation.backgroundImageData)) {
        backgroundImageData = observations.find(observation => observation.backgroundImageData).backgroundImageData
    }

    L.polygonClusterable = L.Polygon.extend({
        _originalInitialize: L.Polygon.prototype.initialize,

        initialize: function (bounds, options) {
            this._originalInitialize(bounds, options);
            this._latlng = this.getBounds().getCenter();
        },

        getLatLng: function () {
            return this._latlng;
        },

        setLatLng: function () {}
    })

    const getGeoObjectGeometries = () => {
        if (clusteredLayer.current && normalLayer.current) {
            clusteredLayer.current.clearLayers();
            normalLayer.current.clearLayers();
            
            var objectsToCluster = L.markerClusterGroup();

            var deflateFeatures = L.deflate({minSize: 5, markerLayer: objectsToCluster, markerType: L.marker});
            deflateFeatures.addTo(clusteredLayer.current);

            Array.from(observations).forEach((observation) => Array.from(observation.geoObjects).forEach((geoObject) => {
                switch(geoObject.geometry.type) {
                    case 'Polygon':
                        const leafletPolygon = new L.polygonClusterable(
                            geoObject.geometry.coordinates, {
                                color: typeColors.get(geoObject.type) || "black",
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.65,
                                crs: L.CRS.Simple
                            }
                        ).bindTooltip(
                            `<b>Type:</b> ${geoObject.type}<br>` +
                            (geoObject.customAttributes ? Object.entries(geoObject.customAttributes).map((item, i) => {
                                return "<div key={" + i + "}><b>" + item[0] + ":</b> " + item[1] + "</div>";
                            }) : ""));
                        leafletPolygon.addTo(normalLayer.current);
                        leafletPolygon.addTo(deflateFeatures);
                        return;
                    case 'Point':
                        const leafletCircle = L.circle(
                            geoObject.geometry.coordinates, {
                                color: typeColors.get(geoObject.type) || "black",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.65,
                                radius: 4,
                                crs: L.CRS.Simple
                            }
                        ).bindTooltip(
                            `<b>Type:</b> ${geoObject.type}<br>` +
                            (geoObject.customAttributes ? Object.entries(geoObject.customAttributes).map((item, i) => {
                                return "<div key={" + i + "}><b>" + item[0] + ":</b> " + item[1] + "</div>";
                            }) : "")
                        ).addTo(normalLayer.current);
                        leafletCircle.addTo(objectsToCluster);
                        return;
                    case 'Rectangle':
                        const leafletRectangle = L.rectangle(
                            geoObject.geometry.coordinates, {
                                color: typeColors.get(geoObject.type) || "black",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.65,
                                radius: 4,
                                crs: L.CRS.Simple
                            }
                        ).bindTooltip(
                            `<b>Type:</b> ${geoObject.type}<br>` +
                            (geoObject.customAttributes ? Object.entries(geoObject.customAttributes).map((item, i) => {
                                return "<div key={" + i + "}><b>" + item[0] + ":</b> " + item[1] + "</div>";
                            }) : "")
                        ).addTo(normalLayer.current)
                        leafletRectangle.addTo(clusteredLayer.current);
                        return;
                    case 'LineString':
                        const leafletLine = L.polyline(
                            geoObject.geometry.coordinates, {
                                color: typeColors.get(geoObject.type) || "black",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.65,
                                radius: 4,
                                crs: L.CRS.Simple
                            }
                        ).bindTooltip(
                            `<b>Type:</b> ${geoObject.type}<br>` +
                            (geoObject.customAttributes ? Object.entries(geoObject.customAttributes).map((item, i) => {
                                return "<div key={" + i + "}><b>" + item[0] + ":</b> " + item[1] + "</div>";
                            }) : "")
                        ).addTo(normalLayer.current)
                        leafletLine.addTo(clusteredLayer.current);
                        return;
                    default:
                        return;
                }
            }));
        }
    };

    getGeoObjectGeometries();

    return backgroundImageData ? (
        <MapContainer
            center={[-(backgroundImageData.height/2), backgroundImageData.width/2]}
            crs={L.CRS.Simple}
            style={{ height: "100%", width: "100%" }}
            minZoom={-2}
            maxZoom={5}
            zoom={-2}
            scrollWheelZoom={true}
            zoomControl={true}
        >
            <BackgroundImage
                backgroundImageData={backgroundImageData}
                setBoundingBox={setBoundingBox}
            />
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Clustered geoobjects">
                    <LayerGroup ref={clusteredLayer}
                        eventHandlers={{
                            add: () => {
                                getGeoObjectGeometries();
                            }
                        }} 
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Nonclustered geoobjects">
                    <LayerGroup ref={normalLayer}
                        eventHandlers={{
                            add: () => {
                                getGeoObjectGeometries();
                            }
                        }} 
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
        </MapContainer>
    ) : (
        <div>Map is not available.
        </div>
    )
};