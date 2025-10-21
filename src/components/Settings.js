import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, Slider, TextField } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from "react";

import "./Settings.css"


export default function Settings({ pointRadius, setPointRadius, dataSource, setDataSource, typeColors, setTypeColors, preloadTypes }) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [newDataSource, setNewDataSource] = useState(dataSource);

    const handleSettingsOpen = () => {
        setSettingsOpen(true);
    }

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    }

    const handleSettingsDone = () => {
        if(newDataSource !== dataSource) {
            setDataSource(newDataSource);
        }
        setSettingsOpen(false);
    }

    return (
        <div className="settings-container">
            <IconButton
                onClick={handleSettingsOpen}
            >
                <SettingsIcon />
            </IconButton>
            <Dialog
                fullWidth={true}
                open={settingsOpen}
                onClose={handleSettingsClose}
            >
                <DialogTitle>
                    <h2>Settings</h2>
                </DialogTitle>
                <DialogContent>
                    <List>
                        <Box key={"point radius"} sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between"}}>
                            <h3>Point Radius</h3>
                            <Slider
                                aria-label="pointRadius"
                                defaultValue={pointRadius}
                                getAriaValueText={(value) => {return `${value}`}}
                                valueLabelDisplay="auto"
                                step={1}
                                marks
                                color="inherit"
                                min={1}
                                max={150}
                                onChange={(_, value) => { setPointRadius(value) }}
                            />
                        </Box>
                        <Box key={"data source"} sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between"}}>
                            <h3>Data source</h3>
                            <TextField
                                id="dataSource"
                                name="dataSource"
                                label="Data Source"
                                fullWidth
                                variant="outlined"
                                defaultValue={dataSource}
                                value={newDataSource}
                                onChange={(event) => {
                                    setNewDataSource(event.target.value);
                                }}
                            />
                        </Box>
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button color="inherit" onClick={handleSettingsDone}>Done</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}