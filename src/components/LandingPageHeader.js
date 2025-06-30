import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './LandingPageHeader.css';

export default function LandingPageHeader({ handleDrawerToggle }) {
    return (
        <div className="landing-page-header">
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => handleDrawerToggle()}
                sx={{ mr: 2, display: { sm: 'none' } }}
            >
                <MenuIcon />
          </IconButton>
            <h1>Welcome to the 4DGeo Dashboard!</h1>
            <p>Create your own custom Dashboard for monitoring 4D Data</p>
        </div>
    )
}