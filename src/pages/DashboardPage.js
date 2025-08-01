import { useSearchParams } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { fetchJsonData } from "../utils/http_fetcher";
import { Button, Divider, styled } from "@mui/material";
import { addDays } from "date-fns";
import ColorAssignment from "../components/dashboard-creation/ColorAssignment";
import AddIcon from '@mui/icons-material/Add'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import L from "leaflet";

import './DashboardPage.css'

function DashboardPage() {
    const urlParams = new URLSearchParams(atob(useSearchParams()[0].get("state")))
    const [observations, setObservations] = useState([])
    const [wasFileUploaded, setWasFileUploaded] = useState(false);
    const [config, setConfig] = useState({})

    const [typeColors, setTypeColors] = useState(new Map());

    const [dateRange, setDateRange] = useState({ startDate: 0, endDate: Date.now()});
    const [sliderRange, setSliderRange] = useState([0, 100]);
    const [dateTimeRange, setDateTimeRange] = useState({ startDate: 0, endDate: Date.now()});
    const [chartSelectedIndex, setChartSelectedIndex] = useState(-1)

    const [boundingBox, setBoundingBox] = useState(null);

    const getAllTypes = (observations) => {
        const allTypes = new Set();
        observations.forEach(observation => {
            observation.geoObjects.forEach(geoObject => {
                allTypes.add(geoObject.type);
            });
        });

        return allTypes;
    }

    const completeTypeColors = (inputTypeColors, observations) => {
        const allTypes = getAllTypes(observations);
        const newTypeColorsList = new Map();
        allTypes.forEach((type) => {
            if(!inputTypeColors.has(type)) {
                newTypeColorsList.set(type, `#${Math.floor(Math.random()*16777215).toString(16)}`);
            } else {
                newTypeColorsList.set(type, inputTypeColors.get(type));
            }
        });

        return newTypeColorsList;
    }

    const loadData = async (isInitialLoad = false) => {
        const data = await fetchJsonData(urlParams.get('url'));
        if (data == null) {
            setObservations([]);
        } else {
            if(isInitialLoad) {
                resetDashboardState(data.observations);
                
                const urlTypeColors = new Map(Array.from(JSON.parse(urlParams.get('typeColors'))));
                const completedTypeColors = completeTypeColors(urlTypeColors, data.observations);
                setTypeColors(completedTypeColors);
            } else {
                setTypeColors(oldTypeColors => {
                    const completedTypeColors = completeTypeColors(oldTypeColors, data.observations);
                    return completedTypeColors;
                })
            }
            setObservations(data.observations);
        }
    }

    async function fetchConfig() {
        const json = await (await fetch(`config.json`, {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        })).json();
        setConfig(json);
    }

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if(!wasFileUploaded) {
            loadData(true);

            const intervalResolution = urlParams.get('interval') == null ? 0 : urlParams.get('interval');
            if (intervalResolution > 0) {
                const interval = setInterval(() => {
                    if(!wasFileUploaded) {
                        loadData(false);
                        console.log("Reloading data!");
                    }
                }, Number.parseInt(intervalResolution)*1000);

                return () => clearInterval(interval);
            } else {
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wasFileUploaded]);

    const getDateFromDateTime = (dateTime) => {
        let date = new Date(dateTime);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }

    const resetDashboardState = (observations) => {
        setChartSelectedIndex(-1);
        let tempStartEnd = {
            startDate: Math.min(...observations.map(observation => {
                return Date.parse(observation.startDateTime);
            })), 
            endDate: Math.max(...observations.map(observation => Date.parse(observation.startDateTime)))
        }
        setDateRange({startDate: getDateFromDateTime(tempStartEnd.startDate), endDate: addDays(getDateFromDateTime(tempStartEnd.endDate), 1) - 1});

        const uniqueDateTimes = Array.from(new Set(observations.map(observation => Date.parse(observation.startDateTime))))

        if(uniqueDateTimes.length >= 2) {
            setSliderRange([uniqueDateTimes[uniqueDateTimes.length - 1]])
            setDateTimeRange({
                startDate: uniqueDateTimes[uniqueDateTimes.length - 1],
                endDate: uniqueDateTimes[uniqueDateTimes.length - 1]
            })
        } else {
            setSliderRange([0, 100])
        }
    }

    const onFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            try {
                const jsonData = JSON.parse(content);
                if (jsonData.observations) {
                    setObservations(jsonData.observations);
                    setWasFileUploaded(true);

                    resetDashboardState(jsonData.observations);
                    setTypeColors(completeTypeColors(new Map(), jsonData.observations));
                } else {
                    console.error("Invalid data format");
                }
            } catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        }
        reader.readAsText(file)
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


    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <Box className="dashboard-container" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', maxHeight: '7rem', boxSizing: 'border-box', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem'}}>
               <a href={window.location.origin + "/" + config.APP_NAME}><img src={config?.APP_ICON} alt="App-Logo" width={200} /></a>
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", gap: "1.2rem"}}>
                    <ColorAssignment typeColors={typeColors} setTypeColors={setTypeColors} />
                    <Button 
                        variant="contained"
                        startIcon={<ArrowOutwardIcon />}
                        onClick={exportVisibleGeoobjects}
                    >
                        Export by map extent
                    </Button>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<AddIcon />}
                        >
                        Upload data
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => onFileUpload(e)}
                        />
                    </Button>
                </Box>
            </Box>

            <Divider />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '1em' }}>
                <Dashboard
                    layout={JSON.parse(urlParams.get('layout'))}
                    observations={observations}
                    typeColors={typeColors}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    sliderRange={sliderRange}
                    setSliderRange={setSliderRange}
                    dateTimeRange={dateTimeRange}
                    setDateTimeRange={setDateTimeRange}
                    chartSelectedIndex={chartSelectedIndex}
                    setChartSelectedIndex={setChartSelectedIndex}
                    setBoundingBox={setBoundingBox}
                />
            </Box>
        </Box>
    )
}

export default DashboardPage;