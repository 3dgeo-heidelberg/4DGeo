import { TextField, Button, Menu, MenuItem, Box, Snackbar } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DashboardPreview from "./DashboardPreview";
import { useState } from "react";

import './DashboardCreation.css';
import { useNavigate, createSearchParams, useHref } from "react-router-dom";
import { fetchJsonData } from "../../utils/http_fetcher";
import ColorAssignment from "./ColorAssignment";

const minimumModuleSizes = new Map([
    ["Chart", {w: 2, h: 2}],
    ["View2D", {w: 4, h: 2}],
    ["DateRangePicker", {w: 2, h: 1}],
    ["Slider", {w: 2, h: 1}]
  ])

function DashboardCreation({ layout, setLayout, url, setUrl, interval, setInterval, typeColors, setTypeColors }) {
    const navigate = useNavigate();
    const baseurl = useHref("/");
    const [counterForKey, setCounterForKey] = useState(0)
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (event) => {
        addModuleToLayout(event.currentTarget.firstChild.textContent)
        setAnchorEl(null);
    };

    const preloadTypes = async () => {
        const data = await fetchJsonData(url);

        if(data !== null && data.observations) {
            const types = new Set();
            data.observations.forEach(observation => {
                observation.geoObjects.forEach(geoObject => {
                    types.add(geoObject.type);
                });
            });

            const typeColors = new Map();
            types.forEach((type) => typeColors.set(type, `#${Math.floor(Math.random()*16777215).toString(16)}`))

            setTypeColors(typeColors);
        }
    }

    const addModuleToLayout = (moduleName) => {
        if (moduleName === "2D View") {
            moduleName = "View2D";
        }
        setLayout(layout.concat({
            i: "" + moduleName + "_" + counterForKey,
            x: Infinity,
            y: Infinity,
            w: minimumModuleSizes.get(moduleName).w,
            h: minimumModuleSizes.get(moduleName).h,
            minW: minimumModuleSizes.get(moduleName).w,
            minH: minimumModuleSizes.get(moduleName).h,
        }));
        setCounterForKey(counterForKey + 1);
    }
    
    const onLayoutChange = (newLayout) => {
        setLayout(newLayout);
    }

    const getPermalink = () => {
        const baseLink = window.location.origin + baseurl + '/dashboard'

        const searchParams = new URLSearchParams({
            "layout": JSON.stringify(layout),
            "url": url,
            "interval": interval,
            "typeColors": JSON.stringify([...typeColors])
        }).toString();
        console.log(btoa(searchParams), searchParams)

        return baseLink + "?state=" + btoa(searchParams);
    }

    const handlePermalink = () => {
        navigator.clipboard.writeText(getPermalink());
        setSnackbarOpen(true);
    }

    const handleGo = () => {
        navigate({
            pathname: "/dashboard",
            search: createSearchParams({
                state: getPermalink().split("?state=")[1]
            }).toString()
        })
    }

    const getAspectRatioOfScreen = () => {
        const width = window.innerWidth;
        const height = window.innerHeight - (window.innerHeight*0.05 - 2*(parseFloat(getComputedStyle(document.documentElement).fontSize)));

        return width/height;
    }

    const aspectRatio = getAspectRatioOfScreen();

    return (
        <div className="container">
            <div className="header">
                <div className="headline-buttons" style={{display: "flex"}}>
                    <h2 className="headline">Customize your Dashboard</h2>

                    <div className="buttons" style={{display: "flex"}}>
                        <Button 
                            id="moduleSelectButton"
                            color="primary"
                            aria-label="add" 
                            variant="contained" 
                            onClick={handleClick}
                            aria-controls={open ? 'demo-positioned-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined} 
                            startIcon={<AddIcon/>}
                        >                        
                            Add Module
                        </Button>

                        <Menu
                            id="moduleSelect"
                            aria-labelledby="moduleSelectButton"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => setAnchorEl(null)}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            <MenuItem onClick={handleClose}>2D View</MenuItem>
                            <MenuItem onClick={handleClose}>Chart</MenuItem>
                            <MenuItem onClick={handleClose}>DateRangePicker</MenuItem>
                            <MenuItem onClick={handleClose}>Slider</MenuItem>
                        </Menu>

                        <ColorAssignment typeColors={typeColors} setTypeColors={setTypeColors} preloadTypes={preloadTypes} />
                    </div>
                </div>
                <Box className="input-area">
                    <TextField id="url-input" label="Link to your data source" variant="outlined" onChange={(event) => {
                            setUrl(event.target.value);
                        }} 
                        value={url}
                    />

                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1.2rem"}}>
                        <TextField id="interval-input" label="Refresh Interval - seconds" variant="outlined" type="number" onChange={(event) => {
                                setInterval(event.target.value);
                            }}
                            value={interval}
                        />
                    </Box>
                </Box>
            </div>

            <DashboardPreview
                layout={layout}
                onLayoutChange={onLayoutChange}
                minimumModuleSizes={minimumModuleSizes}
                style={{aspectRatio: aspectRatio, height: '40px', background: 'white', position: 'relative'}}
            />

            <div className="footer">
                <Button 
                    id=""
                    color="primary" 
                    variant="contained" 
                    onClick={handlePermalink}
                    startIcon={<ContentCopyIcon/>}
                >
                    Permalink  
                </Button>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000}
                    onClose={() => {setSnackbarOpen(false)}}
                    message={"Permalink copied to your clipboard"}
                />

                <Button 
                    id=""
                    color="primary" 
                    variant="contained" 
                    onClick={handleGo}
                >
                    Go  
                </Button>
            </div>
        </div>
    );
};

export default DashboardCreation