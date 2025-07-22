import "./DashboardPreview.css";

import { Responsive, WidthProvider } from "react-grid-layout";

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

    return (
            <ResponsiveGridLayout
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