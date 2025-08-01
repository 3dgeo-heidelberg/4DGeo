import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

const config = await (await fetch(`./config.json`, {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        })).json();

root.render(
  <React.StrictMode>
    <link rel="icon" href={config.ICON_3DGEO} />
    <BrowserRouter basename={'/' + config.APP_NAME}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
