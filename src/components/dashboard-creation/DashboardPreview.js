import "./DashboardPreview.css";

import { Responsive, WidthProvider } from "react-grid-layout";
import { Box } from "@mui/material";

const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardPreview({ layout, onLayoutChange, minimumModuleSizes }) {
    const generateDOM = () => {
        return Array.from(layout).map((layoutItem) => {
            return (
                <div
                    className={`grid-item ${layoutItem["i"].toString()}`}
                    key={layoutItem["i"]}
                    data-grid={{
                        x: layoutItem["x"],
                        y: layoutItem["y"],
                        w: layoutItem["w"],
                        h: layoutItem["h"],
                        i: layoutItem["i"],
                        minW: minimumModuleSizes.get(layoutItem["i"].split("_")[0]).w,
                        minH: minimumModuleSizes.get(layoutItem["i"].split("_")[0]).h,
                    }}
                >
                    <div className="content">{layoutItem["i"].split("_")[0]}</div>
                </div>
            )
        })
    }

    const getAspectRatioOfScreen = () => {
        const width = window.innerWidth;
        const height = window.innerHeight - (window.innerHeight*0.05 - 2*(parseFloat(getComputedStyle(document.documentElement).fontSize)));

        return width/height;
    }

    const aspectRatio = getAspectRatioOfScreen();

    return (
        <Box className="layout-container" sx={{aspectRatio: aspectRatio}}>
            <ResponsiveGridLayout
                layout={layout}
                onLayoutChange={onLayoutChange}
                className= "layout"
            >
                {generateDOM()}
            </ResponsiveGridLayout>
        </Box>
    );
};

export default DashboardPreview