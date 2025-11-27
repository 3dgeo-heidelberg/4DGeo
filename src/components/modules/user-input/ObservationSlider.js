import './ObservationSlider.css'
import { Box, CircularProgress, IconButton, Slider, Stack, Switch } from '@mui/material';
import PlayCircle from '@mui/icons-material/PlayCircle';
import StopCircle from '@mui/icons-material/StopCircle';
import NumberField from '../../mui-components/NumberField';

export default function ObservationSlider({ 
    includedDateTimes,
    sliderRange,
    handleSliderRangeChange,
    isInAnimation,
    animationSliderRange,
    secondsPerFrame,
    setSecondsPerFrame,
    handlePlayButton,
    isPreloadingImages
}) {
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
    };

    const handleSliderClick = (newValue) => {
        if(!isInAnimation) { handleSliderRangeChange(newValue) }
    };
    
    return includedDateTimes.length > 1 ? (
        <div className='slider-container'>
            <Box className='slider-options'>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>Single</span>
                    <Switch checked={sliderRange.length === 1 ? false : true} onChange={handleSwitchChange} />
                    <span>Range</span>
                </Stack>
                <div>
                    <NumberField 
                        label="Seconds per Frame"
                        min={0.1}
                        max={100}
                        size='small'
                        value={secondsPerFrame}
                        onValueChange={(newValue) => setSecondsPerFrame(newValue)}
                    />
                </div>
                <div className='play-button-container'>
                    <IconButton 
                        className='play-button'
                        onClick={() => handlePlayButton(includedDateTimes)}
                    > 
                        {isInAnimation ? <StopCircle /> : (<PlayCircle />)}
                    </IconButton>
                    {isPreloadingImages && (
                        <CircularProgress
                            className='preloading-animation'
                        />
                    )}
                </div>
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
                value={isInAnimation ? [animationSliderRange[0], sliderRange[0], animationSliderRange[1]] : sliderRange}
                onChange={(_, newValue) => handleSliderClick(newValue)}
                disableSwap
                className='observation-slider'
            />
        </div>
    ) : (
        <Slider className='slider-container' disabled/>
    )
}