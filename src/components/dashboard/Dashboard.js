import MapView from "../modules/visualisation/2DViewMap/View2D";
import "./Dashboard.css"

import { Responsive, WidthProvider } from "react-grid-layout";
import DateRangePicker from "../modules/user-input/DateRangePicker";
import ObservationSlider from "../modules/user-input/ObservationSlider";
import Chart from "../modules/visualisation/Chart/Chart";

const ResponsiveGridLayout = WidthProvider(Responsive);

function Dashboard({ layout, observations, typeColors, dateRange, setDateRange, sliderRange, setSliderRange, dateTimeRange, setDateTimeRange, setBoundingBox }) {

    const filterObservations = (startDate, endDate) => {
        return Array.from(observations).filter((observation) => {
            return Date.parse(observation.startDateTime) >= startDate && Date.parse(observation.startDateTime) <= endDate;
        }).sort((a, b) => a.startDateTime > b.startDateTime ? 1 : -1);
    }

    const resetSliderRange = (includedDateTimes) => {
        const newSliderRange = [includedDateTimes[includedDateTimes.length - 1]];
        setSliderRange(newSliderRange);
        return newSliderRange;
    }

    const handleDateRangeSelected = (newDateRange) => {  
        
        setDateRange(newDateRange);    
        let newFilteredObservations = filterObservations(newDateRange.startDate, newDateRange.endDate);

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

    const getGridItemContent = (moduleName) => {
        switch(moduleName) {
            case 'Slider':
                return(
                    <ObservationSlider
                        includedDateTimes={Array.from(new Set(Array.from(filterObservations(dateRange.startDate, dateRange.endDate)).map(observation => new Date(Date.parse(observation.startDateTime)))))}
                        sliderRange={sliderRange}
                        handleSliderRangeChange={handleSliderRangeSelected}
                    />
                )
            case 'DateRangePicker':
                return (
                    <DateRangePicker
                        dateRange={dateRange}
                        handleDateRangeChange={handleDateRangeSelected}
                        includedDates={Array.from(new Set(Array.from(observations).map(observation => {
                            const date = new Date(Date.parse(observation.startDateTime));
                            return date.setHours(0, 0, 0, 0)
                        })))}
                    />
                )
            case 'Chart':
                return (
                    <Chart 
                        observations={filterObservations(dateTimeRange.startDate, dateTimeRange.endDate)}
                        typeColors={typeColors}
                    />
                );
            case 'View2D':
                return (
                    <MapView
                        className="mapview"
                        observations={filterObservations(dateTimeRange.startDate, dateTimeRange.endDate)}
                        setBoundingBox={setBoundingBox}
                        typeColors={typeColors}
                    />
                );
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
            onLayoutChange={() => {}}
            className= "layout"
        >
            {generateDOM()}
        </ResponsiveGridLayout>
    );
};

export default Dashboard;