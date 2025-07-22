import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './LandingPageHeader.css';

export default function LandingPageHeader({ handleDrawerToggle, config }) {
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
            <h1 className='header'>
                {config?.APP_HEADER}
            </h1>
        </div>
    )
}