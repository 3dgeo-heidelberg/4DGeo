import { ImageOverlay, useMapEvents } from "react-leaflet";

export default function BackgroundImage({ backgroundImageData, setBoundingBox }) {
    // eslint-disable-next-line no-unused-vars
    const map = useMapEvents({
        moveend: (e) => {
            const bounds = e.target.getBounds();
            setBoundingBox(bounds);
        }
    });

    return (
        <ImageOverlay
            url={backgroundImageData.url}
            bounds={
                [[(-backgroundImageData.height), 0],
                [0, backgroundImageData.width]]
            }
        />
    );
}