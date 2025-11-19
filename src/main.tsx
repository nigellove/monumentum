import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import './index.css'

 Sentry.init({
  dsn: "https://016ac246559dae1d1230479dfbe20484@o4510347485511681.ingest.us.sentry.io/4510347486560256",
  environment: "production",
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
