import AddIcon from '@mui/icons-material/Add'
import { Button, styled } from '@mui/material';

export default function UploadButton({ setObservations, setWasFileUploaded, resetDashboardState, setTypeColors, completeTypeColors }) {

    const onFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            try {
                const jsonData = JSON.parse(content);
                if (jsonData.observations) {
                    setObservations(jsonData.observations);
                    setWasFileUploaded(true);

                    resetDashboardState(jsonData.observations);
                    setTypeColors(completeTypeColors(new Map(), jsonData.observations));
                } else {
                    console.error("Invalid data format");
                }
            } catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        }
        reader.readAsText(file)
    }

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <Button
            component="label"
            variant="contained"
            startIcon={<AddIcon />}
            >
            Upload data
            <VisuallyHiddenInput
                type="file"
                onChange={(e) => onFileUpload(e)}
            />
        </Button>
    )
}