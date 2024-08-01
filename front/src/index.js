import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/authContext';
import { CategoryProvider } from './context/CategoryContext';
import { ApiProvider } from './context/ApiContext';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <BrowserRouter> {/* Wrap with BrowserRouter */}
    <ApiProvider>
      <AuthProvider>
        <CategoryProvider>
          <App />
        </CategoryProvider>
      </AuthProvider>
    </ApiProvider>
  </BrowserRouter>
);
