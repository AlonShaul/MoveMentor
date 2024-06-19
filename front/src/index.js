import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/authContext';
import { CategoryProvider } from './context/CategoryContext';
import { ApiProvider } from './context/ApiContext'; // Add ApiProvider here

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <ApiProvider> {/* Wrap with ApiProvider */}
    <AuthProvider>
      <CategoryProvider>
        <App />
      </CategoryProvider>
    </AuthProvider>
  </ApiProvider>
);
