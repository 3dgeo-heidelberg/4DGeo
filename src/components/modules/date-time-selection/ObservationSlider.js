import Slider from '@mui/material/Slider';

import './ObservationSlider.css'
import { Box, Stack, Switch } from '@mui/material';

export default function ObservationSlider({ includedDateTimes, sliderRange, handleSliderRangeChange }) {

    const handleSwitchChange = (event) => {
        if (event.target.checked) {
            // Switch to range mode
            const indexOfCurrentRange = includedDateTimes.findIndex(dateTime => dateTime.getTime() === sliderRange[0]);
            if( indexOfCurrentRange === -1) {
                console.warn("Current slider range start date not found in includedDateTimes, defaulting to end date");
                handleSliderRangeChange([includedDateTimes[includedDateTimes.length - 1].getTime(), includedDateTimes[includedDateTimes.lenght - 1].getTime()]);
            } else {
                handleSliderRangeChange([includedDateTimes[indexOfCurrentRange].getTime(), includedDateTimes[indexOfCurrentRange].getTime()]);
            }
        } else {
            // Switch to single mode
            handleSliderRangeChange([sliderRange[1]]);
        }
    }

    return includedDateTimes.length > 1 ? (
        <div className='slider-container'>
            <Box className='slider-options'>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>Single</span>
                    <Switch checked={sliderRange.length === 1 ? false : true} onChange={handleSwitchChange} />
                    <span>Range</span>
                </Stack>
            </Box>
            <Slider
                getAriaValueText={(dateTime) => {
                    let dateObj = new Date(dateTime)
                    return dateObj.toLocaleDateString() + "\n" + dateObj.toLocaleTimeString();
                }}
                step={null}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => {
                    let dateObj = new Date(value);
                    return dateObj.toLocaleDateString() + "\n" + dateObj.toLocaleTimeString();
                }}
                marks={Array.from(includedDateTimes).map((dateTime, index, thisArray) => {
                    if (index === 0 || index === thisArray.length - 1) {
                        return {
                            value: dateTime.getTime(),
                            label: dateTime.toLocaleDateString() + "\n" + dateTime.toLocaleTimeString()
                        };   
                    } else {
                        return {
                            value: dateTime.getTime()
                        };
                    }
                })}
                min={Math.min(...includedDateTimes)}
                max={Math.max(...includedDateTimes)}
                value={sliderRange}
                onChange={(_, newValue) => handleSliderRangeChange(newValue)}
                disableSwap
                className='observation-slider'
            />
        </div>
    ) : (
        <Slider disabled/>
    )
}