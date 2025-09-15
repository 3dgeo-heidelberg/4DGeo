import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Button } from '@mui/material';
import L from "leaflet";

export default function ExportButton({ observations, boundingBox, dateTimeRange }) {
    const exportVisibleGeoobjects = (e) => {
        e.preventDefault();
        var temporalFilteredObservations = Array.from(observations).filter((observation) => {
            return Date.parse(observation.startDateTime) >= dateTimeRange.startDate && Date.parse(observation.startDateTime) <= dateTimeRange.endDate;
        }).sort((a, b) => a.startDateTime > b.startDateTime ? 1 : -1);
        
        if(boundingBox) {
            temporalFilteredObservations = {
                observations: temporalFilteredObservations.map((observation) => {
                                    return {
                                        ...observation,
                                        geoObjects: observation.geoObjects.filter((geoObject) => {
                                            if(geoObject.geometry.type === 'Polygon' || geoObject.geometry.type === 'LineString') {
                                                for (let i = 0; i < geoObject.geometry.coordinates.length; i++) {
                                                    if (boundingBox.contains(L.latLng(geoObject.geometry.coordinates[i][0], geoObject.geometry.coordinates[i][1]))) {
                                                        return true;
                                                    }
                                                }
                                                return false;
                                            } else if(geoObject.geometry.type === 'Point') {
                                                return boundingBox.contains(L.latLng(geoObject.geometry.coordinates[0], geoObject.geometry.coordinates[1]));
                                            }
                                            return false;
                                        })
                                    };
                               }).filter((observation) => observation.geoObjects.length > 0)
            }
        }

        downloadFile({ data: JSON.stringify(temporalFilteredObservations) });
    }

    const downloadFile = ({ data }) => {
        const blob = new Blob([data], { type: 'application/json' })
        const a = document.createElement('a')
        a.download = 'exported_filtered_data.json'
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }
    
    return (
        <Button
            variant="contained"
            startIcon={<ArrowOutwardIcon />}
            onClick={exportVisibleGeoobjects}
        >
            Export by map extent
        </Button>
    )
}