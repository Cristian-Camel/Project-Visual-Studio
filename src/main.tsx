import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles.css';
import { PresentationProvider } from './store/PresentationStore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PresentationProvider>
      <App />
    </PresentationProvider>
  </React.StrictMode>,
);
