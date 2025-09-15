import { useSearchParams } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { fetchJsonData } from "../utils/http_fetcher";
import { Divider } from "@mui/material";
import { addDays } from "date-fns";
import ColorAssignment from "../components/dashboard-creation/ColorAssignment";

import './DashboardPage.css'
import ExportButton from "../components/dashboard/ExportButton";
import UploadButton from "../components/dashboard/UploadButton";

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

    return (
        <Box className="dashboard-container" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', maxHeight: '7rem', boxSizing: 'border-box', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem'}}>
               <a href={window.location.origin + "/" + config.APP_NAME}><img src={config?.APP_ICON} alt="App-Logo" width={200} /></a>
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", gap: "1.2rem"}}>
                    <ColorAssignment id="" typeColors={typeColors} setTypeColors={setTypeColors} />
                    <ExportButton
                        observations={observations}
                        boundingBox={boundingBox}
                        dateTimeRange={dateTimeRange}
                    />
                    <UploadButton
                        setObservations={setObservations}
                        setWasFileUploaded={setWasFileUploaded}
                        resetDashboardState={resetDashboardState}
                        setTypeColors={setTypeColors}
                        completeTypeColors={(inputTypeColors) => completeTypeColors(inputTypeColors, observations)}
                    />
                </Box>
            </Box>

            <Divider />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '1em' }}>
                <Dashboard
                    className="dashboard"
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