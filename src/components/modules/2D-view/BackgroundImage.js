import { ImageOverlay, useMapEvent, useMapEvents } from "react-leaflet";

export default function BackgroundImage({ backgroundImageData, setBoundingBox }) {
    const map = useMapEvents({
        moveend: (e) => {
            const bounds = e.target.getBounds();
            setBoundingBox(bounds);
        }
    });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'];
    
    const isImageUrlOrPath = (str) => {
        try {
        const url = new URL(str);
        return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
        } catch {
        // Not a valid URL, maybe just a local path
        return imageExtensions.some(ext => str.toLowerCase().endsWith(ext));
        }
    };

    const isBase64DataUri = (str) => {
        return /^data:image\/[a-zA-Z]+;base64,/.test(str);
    };

    const isRawBase64Image = (str) => {
        try {
            const decoded = atob(str);
            // eslint-disable-next-line no-control-regex
            return decoded.length > 100 && /[\x00-\x08\x0E-\x1F]/.test(decoded.slice(0, 100));
        } catch {
            return false;
        }
    };

    const getImageSrc = (imageData) => {
        if (isImageUrlOrPath(imageData) || isBase64DataUri(imageData)) {
            return imageData;
        } else if (isRawBase64Image(imageData)) {
            return `data:image/ong;base64,${imageData}`;
        } else {
            console.error("Invalid image data format. Expected a valid URL, base64 data URI, or raw base64 string.");
        }
    }

    return (
        <ImageOverlay
            eventHandlers={{
                
            }}
            url={getImageSrc(backgroundImageData.url)}
            bounds={
                [[(-backgroundImageData.height), 0],
                [0, backgroundImageData.width]]
            }
            opacity={0.9}
        />
    );
}