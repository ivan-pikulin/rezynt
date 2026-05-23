import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './shared/i18n';
import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';

// Initialize PostHog with reverse proxy
posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://rezynt.ru/ingest',
  ui_host: 'https://us.posthog.com', // for PostHog UI features
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true, // Capture clicks and form submissions automatically
  loaded: (posthog) => {
    if (import.meta.env.DEV) posthog.debug(); // Enable debug mode in development
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
