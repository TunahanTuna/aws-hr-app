

import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { AppRouter } from './router/AppRouter';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </AppProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
