import MapView from "../modules/2D-view/View2D";
import "./Dashboard.css"

import { Responsive, WidthProvider } from "react-grid-layout";
import DateRangePicker from "../modules/date-time-selection/DateRangePicker";
import ObservationSlider from "../modules/date-time-selection/ObservationSlider";
import Chart from "../modules/Chart";

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

    const generateDOM = () => {
        return Array.from(layout).map((layoutItem, i) => {
            const moduleName = layoutItem["i"].split("_")[0]
            switch(moduleName) {
                case 'Slider':
                    return(
                        <div
                            className="reactGridItem"
                            key={layoutItem["i"]}
                            data-grid={{    
                                x: layoutItem["x"],
                                y: layoutItem["y"],
                                w: layoutItem["w"],
                                h: layoutItem["h"],
                                i: layoutItem["i"],
                                minW: 2,
                                minH: 1,
                                static: true
                            }}
                        >
                            <ObservationSlider
                                includedDateTimes={Array.from(new Set(Array.from(filterObservations(dateRange.startDate, dateRange.endDate)).map(observation => new Date(Date.parse(observation.startDateTime)))))}
                                sliderRange={sliderRange}
                                handleSliderRangeChange={handleSliderRangeSelected}
                            />
                        </div>
                    )
                case 'DateRangePicker':
                    return (
                        <div
                            className="reactGridItem"
                            key={layoutItem["i"]}
                            data-grid={{    
                                x: layoutItem["x"],
                                y: layoutItem["y"],
                                w: layoutItem["w"],
                                h: layoutItem["h"],
                                i: layoutItem["i"],
                                minW: 2,
                                minH: 1,
                                static: true
                            }}
                        >
                            <DateRangePicker
                                dateRange={dateRange}
                                handleDateRangeChange={handleDateRangeSelected}
                                includedDates={Array.from(new Set(Array.from(observations).map(observation => {
                                    const date = new Date(Date.parse(observation.startDateTime));
                                    return date.setHours(0, 0, 0, 0)
                                })))}
                            />
                        </div>
                    )
                case 'Chart':
                    return (
                        <div
                            className="reactGridItem"
                            key={layoutItem["i"]}
                            data-grid={{   
                                x: layoutItem["x"],
                                y: layoutItem["y"],
                                w: layoutItem["w"],
                                h: layoutItem["h"],
                                i: layoutItem["i"],
                                minW: 3,
                                minH: 1,           
                                static: true
                            }}
                        >
                           <Chart 
                                observations={filterObservations(dateTimeRange.startDate, dateTimeRange.endDate)}
                                typeColors={typeColors}
                            />
                        </div>
                    );
                case 'View2D':
                    return (
                        <div
                            className="reactGridItem"
                            key={layoutItem["i"]}
                            data-grid={{
                                x: layoutItem["x"],
                                y: layoutItem["y"],
                                w: layoutItem["w"],
                                h: layoutItem["h"],
                                i: layoutItem["i"],
                                minW: 6,

                                minH: 3,  
                                static: true
                            }}
                        >
                           <MapView
                                className="mapview"
                                observations={filterObservations(dateTimeRange.startDate, dateTimeRange.endDate)}
                                typeColors={typeColors}
                                setBoundingBox={setBoundingBox}
                            />
                        </div>
                    );
                default:
                    return (<div>Not a supported module name</div>);
            }
        })
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