import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, ListSubheader, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import './LandingPage.css';
import DashboardCreation from "../components/dashboard-creation/DashboardCreation";
import LandingPageHeader from "../components/LandingPageHeader";
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';

export default function LandingPage() {
  const [config, setConfig] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(-1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [drawerIsClosing, setDrawerIsClosing] = useState(false);

  const [loadFromPermalinkOpen, setLoadFromPermalinkOpen] = useState(false);
  const [temporaryPermalink, setTemporaryPermalink] = useState("");
  const [permalinkError, setPermalinkError] = useState(false);
  const drawerWidth = 230;

  const [layout, setLayout] = useState([]);
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(0);
  const [typeColors, setTypeColors] = useState(new Map());


  const handleDrawerClose = () => {
    setDrawerIsClosing(true);
    setMobileDrawerOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setDrawerIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!drawerIsClosing) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    }
  };


  async function fetchConfig() {
    const json = await (await fetch(`config.json`, {
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })).json();
    setConfig(json);
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleDashboardCreationSelection = () => {
    setLayout([]);
    setUrl("");
    setInterval(0);
  }

  const handleLoadFromPermalinkSelection = () => {
    setLoadFromPermalinkOpen(true);
  };

  const populateFromPermalink = (permalink) => {
    const url = new URL(permalink);
    setLayout(JSON.parse(url.searchParams.get('layout') || []));
    setUrl(url.searchParams.get('url') || "");
    setInterval(parseInt(url.searchParams.get('interval')) || 0);
    setTypeColors(new Map(JSON.parse(url.searchParams.get('typeColors') || new Map())));
  }

  const handleLoadFromPermalinkClose = () => {
    if (temporaryPermalink && temporaryPermalink.length > 0) {
      try {
        populateFromPermalink(temporaryPermalink)
      }
      catch (e) {
        setPermalinkError(true);
        return;
      }
    }
    setLoadFromPermalinkOpen(false);
    setPermalinkError(false);
    setTemporaryPermalink("");
    setSelectedTemplate(-1);
  };


  const drawer = (
    <Stack className="example-dashboard-list">
      <List dense>
        <ListItem>
          <Avatar className="avatar" src={config?.APP_ICON} alt="App Logo" />
          <ListItemText primary={config?.APP_TITLE} />
        </ListItem>
      </List>
      <Divider />
      <List dense subheader={
          <ListSubheader component="div" id="subheader-templates">
            Select a template
          </ListSubheader>
        }
      >
        {
          config?.TEMPLATES.map((template, index) => {
            return (
              <ListItemButton
                key={index}
                selected={selectedTemplate === index}
                onClick={() => {
                  populateFromPermalink(template.permalink);
                  setSelectedTemplate(index)
                }}
              >
                <Avatar variant="square" className="avatar" src={template.image}/>
                <ListItemText primary={template.title} />
              </ListItemButton>
            )
          })
        }

        <Divider sx={{ my: 1 }} />

        <ListItemButton
          selected={selectedTemplate === config?.TEMPLATES.length}
          onClick={() => {
            handleLoadFromPermalinkSelection();
            setSelectedTemplate(config?.TEMPLATES.length);
          }}
        >
          <Avatar className="avatar">
            <LinkIcon />
          </Avatar>
          <ListItemText primary="Load from permalink" />
        </ListItemButton>
        <Dialog
          open={loadFromPermalinkOpen}
          onClose={handleLoadFromPermalinkClose}
        >
            <DialogTitle>Load Dashboard from Permalink</DialogTitle>
            <Divider />

            <DialogContent>
                <TextField
                  fullWidth
                  value={temporaryPermalink} 
                  onChange={e => setTemporaryPermalink(e.target.value)} 
                  id="permalink-input-popup" 
                  label="Permalink"
                  error={permalinkError}
                  helperText={permalinkError ? "Invalid permalink format." : ""}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleLoadFromPermalinkClose}>Load</Button>
            </DialogActions>
        </Dialog>

        <ListItemButton
          selected={selectedTemplate === config?.TEMPLATES.length + 1}
          onClick={() => {
            handleDashboardCreationSelection();
            setSelectedTemplate(config?.TEMPLATES.length + 1);
          }}
        >
          <Avatar className="avatar">
            <EditIcon />
          </Avatar>
          <ListItemText primary="Start from scratch" />
        </ListItemButton>
      </List>
    </Stack>
  )


  return (
    <Box className="landing-page-container">
      <Box>
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            width: drawerWidth,
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          className="side-bar"
          slotProps={{
            root: {
              keepMounted: true, // Better open performance on mobile.
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: drawerWidth,
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          className="side-bar"
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component={'main'}
        className="main-content"
        style={{ '--max-width': 'calc(100% - ' + drawerWidth + 'px)'}}
        sx={{
          width: 'var(--max-width)',
          height: '100%'
        }}
      >
        <Box className="content-header">
          <LandingPageHeader handleDrawerToggle={handleDrawerToggle} config={config} />
        </Box>
        
        <DashboardCreation
          layout={layout}
          setLayout={setLayout}
          url={url}
          setUrl={setUrl}
          interval={interval}
          setInterval={setInterval}
          typeColors={typeColors}
          setTypeColors={setTypeColors}
        />
      </Box>
    </Box>
  )
}