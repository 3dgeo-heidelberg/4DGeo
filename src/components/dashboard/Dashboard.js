import MapView from "../modules/visualisation/2DViewMap/View2D";
import "./Dashboard.css"

import { Responsive, WidthProvider } from "react-grid-layout";
import DateRangePicker from "../modules/user-input/DateRangePicker";
import ObservationSlider from "../modules/user-input/ObservationSlider";
import Chart from "../modules/visualisation/Chart/Chart";
import Table from "../modules/visualisation/Table/Table";
import { useRef } from "react";

const ResponsiveGridLayout = WidthProvider(Responsive);

function Dashboard({ 
    layout,
    observations,
    typeColors,
    dateRange,
    setDateRange,
    sliderRange,
    setSliderRange,
    dateTimeRange,
    setDateTimeRange,
    barChartSelectedIndex,
    setBarChartSelectedIndex,
    setBoundingBox,
    selectedObjectId,
    setSelectedObjectId,
    animationIntervalId,
    setAnimationIntervalId,
    secondsPerFrame,
    setSecondsPerFrame,
    isInAnimation,
    setIsInAnimation,
    isPreloadingImages,
    setIsPreloadingImages
}) {
    const animationSliderRange = useRef();

    const getCustomDataAttributes = (observations) => {
        const customDataFields = new Set();
        observations.forEach((observation) => {
            observation.geoObjects.forEach((geoObject) => {
                if (geoObject.customAttributes) {
                    Object.keys(geoObject.customAttributes).forEach((key) => {
                        customDataFields.add(key);
                    });
                }
            });
        });
        return Array.from(customDataFields);
    }

    const filterObservationsByDateTimeRange = (observations, startDate, endDate) => {
        return Array.from(observations).filter((observation) => {
            return Date.parse(observation.startDateTime) >= startDate && Date.parse(observation.startDateTime) <= endDate;
        }).sort((a, b) => a.startDateTime > b.startDateTime ? 1 : -1);

    }

    const filterObservationsByChartSelected = (observations, chartSelectedIndex) => {
        if(typeof observations[chartSelectedIndex] === 'undefined') {
            return observations;
        } else {
            return [observations[chartSelectedIndex]];
        }
    }

    const filterObservationsBySelectedObject = (observations, selectedObjectId) => {
        const filteredObservations = [];

        if(selectedObjectId !== null) {
            observations.forEach(observation => {
                filteredObservations.push({
                    ...observation,
                    geoObjects: observation.geoObjects.filter(geoObject => geoObject.id === selectedObjectId)
                });
            })
        } else {
            filteredObservations.push(...Array.from(observations));
        }

        return filteredObservations;
    }

    const resetSliderRange = (includedDateTimes) => {
        const newSliderRange = [includedDateTimes[includedDateTimes.length - 1]];
        setSliderRange(newSliderRange);
        return newSliderRange;
    }

    const handleDateRangeSelected = (newDateRange) => {  
        setBarChartSelectedIndex(-1);
        setDateRange(newDateRange);    
        let newFilteredObservations = filterObservationsByDateTimeRange(newDateRange.startDate, newDateRange.endDate);

        const newSliderRange = resetSliderRange(Array.from(new Set(newFilteredObservations.map(observation => Date.parse(observation.startDateTime)))));

        setDateTimeRange(newSliderRange.length === 1 ? {
            startDate: newSliderRange[0],
            endDate: newSliderRange[0]
        } : {
            startDate: newSliderRange[0],
            endDate: newSliderRange[1]
        });
    }


    const handleSliderRangeSelected = (newSliderRange) => {
        setBarChartSelectedIndex(-1);
        setSliderRange(newSliderRange);

        if(newSliderRange.length === 1) {
            setDateTimeRange({
                startDate: newSliderRange[0],
                endDate: newSliderRange[0]
            });
        } else {
            setDateTimeRange({
                startDate: newSliderRange[0],
                endDate: newSliderRange[1]
            });
        }
    }

    const handleChartBarSelected = (data, index) => {
        if(index === barChartSelectedIndex) {
            setBarChartSelectedIndex(-1);
        } else {
            setBarChartSelectedIndex(index);
        }
    }


    // Animation handling
    const handlePlayButton = (includedDateTimes) => {
        if(!isInAnimation) {
            if(sliderRange.length === 1) {
                startAnimation(includedDateTimes, includedDateTimes[0].getTime(), includedDateTimes[includedDateTimes.length - 1].getTime())
            } else {
                startAnimation(includedDateTimes, sliderRange[0], sliderRange[1]);
            }
            
            setIsInAnimation(true);
        } else {
            stopAnimation(animationIntervalId);
        }
    }

    const preloadImagesForAnimation = async (images) => {
        return Promise.all(images.map(async (imgSrc) => {
            const img = new Image();
            img.src = imgSrc;
            await img.decode();
            return img;
        }));
    }

    const startAnimation = (includedDateTimes, startDateTime, endDateTime) => {
        setIsPreloadingImages(true);
        let currentIndex = Array.from(includedDateTimes).map(dateTime => dateTime.getTime()).indexOf(startDateTime);
        console.log("curr index", currentIndex, "\nincludedDateTimes", includedDateTimes, startDateTime)
        const endIndex = Array.from(includedDateTimes).map(dateTime => dateTime.getTime()).indexOf(endDateTime);

        animationSliderRange.current = [startDateTime, endDateTime];

        preloadImagesForAnimation(
            filterObservationsByDateTimeRange(observations, startDateTime, endDateTime).map((observation) => observation.backgroundImageData.url)
        ).then(() => {
            setIsPreloadingImages(false);
            stepAnimation(includedDateTimes, currentIndex);

            const interval = setInterval(() => {
                currentIndex++;
                if(currentIndex > endIndex) {
                    stopAnimation(interval);
                } else {
                    stepAnimation(includedDateTimes, currentIndex);
                }
            }, secondsPerFrame * 1000);
            
            setAnimationIntervalId(interval);  
        });
    }

    const stepAnimation = (includedDateTimes, currentIndex) => {
        handleSliderRangeSelected([Array.from(includedDateTimes)[currentIndex].getTime()]);
        setBarChartSelectedIndex(currentIndex);
    }

    const stopAnimation = (intervalId) => {
        clearInterval(intervalId);
        setIsPreloadingImages(false);
        setIsInAnimation(false);
        animationSliderRange.current = null;
    }

    const getObservations = (filterByDateTimeRange, filterBySelectedObject, filterBySelectedBarChart, dateTimeRange = null) => {
        let filteredObservations = observations;

        if(filterByDateTimeRange) { filteredObservations = filterObservationsByDateTimeRange(filteredObservations, dateTimeRange.startDate, dateTimeRange.endDate) }

        if(filterBySelectedObject) { filteredObservations = filterObservationsBySelectedObject(filteredObservations, selectedObjectId) }

        if(filterBySelectedBarChart) { filteredObservations = filterObservationsByChartSelected(filteredObservations, barChartSelectedIndex) }

        return filteredObservations;
    }

    const getGridItemContent = (moduleName) => {
        const customAttributeKeys = getCustomDataAttributes(observations);

        const dateTimesOnSlider = Array.from(new Set(Array.from(filterObservationsByDateTimeRange(observations, dateRange.startDate, dateRange.endDate)).map(observation => new Date(Date.parse(observation.startDateTime)))));

        switch(moduleName) {
            case 'Slider':
                return(
                    <ObservationSlider
                        includedDateTimes={dateTimesOnSlider}
                        sliderRange={sliderRange}
                        animationSliderRange={animationSliderRange.current}
                        handleSliderRangeChange={handleSliderRangeSelected}
                        handlePlayButton={handlePlayButton}
                        stopAnimation={stopAnimation}
                        isInAnimation={isInAnimation}
                        secondsPerFrame={secondsPerFrame}
                        setSecondsPerFrame={setSecondsPerFrame}
                        isPreloadingImages={isPreloadingImages}
                    />
                )
            case 'DateRangePicker':
                return (
                    <DateRangePicker
                        dateRange={dateRange}
                        handleDateRangeChange={handleDateRangeSelected}
                        includedDates={Array.from(new Set(Array.from(observations).map(observation => {
                            const date = new Date(Date.parse(observation.startDateTime));
                            return date.setHours(0, 0, 0, 0);
                        })))}
                    />
                )
            case 'Chart':
                return (
                    <Chart
                        observations={!isInAnimation ? getObservations(
                            true,
                            true,
                            false,
                            dateTimeRange
                        ) : getObservations(
                            true,
                            true,
                            false,
                            { "startDate": animationSliderRange.current[0], "endDate": animationSliderRange.current[1] }
                        )}
                        typeColors={typeColors}
                        onBarClick={handleChartBarSelected}
                        selectedBarIndex={barChartSelectedIndex}
                        customAttributeKeys={customAttributeKeys}
                    />
                );
            case 'View2D':
                return (
                    <MapView
                        className="mapview"
                        observations={getObservations(
                            true,
                            true,
                            true,
                            dateTimeRange
                        )}
                        setBoundingBox={setBoundingBox}
                        typeColors={typeColors}
                        selectedObjectId={selectedObjectId}
                    />
                );
            case 'Table':
                return (
                    <Table
                        observations={getObservations(
                            true,
                            false,
                            true,
                            dateTimeRange
                        )}
                        customAttributeKeys={customAttributeKeys}
                        selectedObjectId={selectedObjectId}
                        setSelectedObjectId={setSelectedObjectId}
                    />
                )
            default:
                return (<div>Not a supported module name</div>);
        }
    };

    const generateDOM = () => {
        return Array.from(layout).map((layoutItem) => {
            const moduleName = layoutItem.i.split("_")[0]

            return (
                <div
                    key={layoutItem.i}
                    className="grid-item"
                    data-grid={{
                        x: layoutItem.x,
                        y: layoutItem.y,
                        w: layoutItem.w,
                        h: layoutItem.h,
                        i: layoutItem.i,
                        static: true
                    }}
                >
                    <div className="grid-item-header">
                        {moduleName}
                    </div>
                    <div className="grid-item-content">
                        {getGridItemContent(moduleName)}
                    </div>
                </div>
            )
        });
    }


    return (
        <ResponsiveGridLayout
            layout={layout}
            cols={{ lg: 12, md: 12, sm: 10, xs: 8, xxs: 6 }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            onLayoutChange={() => {}}
            className= "layout-dashboard"
        >
            {generateDOM()}
        </ResponsiveGridLayout>
    );
};

export default Dashboard;