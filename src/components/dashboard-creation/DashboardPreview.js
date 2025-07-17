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
        const height = window.innerHeight - (5*(parseFloat(getComputedStyle(document.documentElement).fontSize)));

        return width/height;
    }

    let aspectRatio = getAspectRatioOfScreen();
    window.addEventListener("resize", () => {aspectRatio = getAspectRatioOfScreen()})

    return (
            <ResponsiveGridLayout
                // style={{ width: aspectRatio*600, alignSelf: 'center', maxWidth: '100%' }}
                layout={layout}
                cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 6 }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                onLayoutChange={onLayoutChange}
                className= "layout-preview"
            >
                {generateDOM()}
            </ResponsiveGridLayout>
    );
};

export default DashboardPreview