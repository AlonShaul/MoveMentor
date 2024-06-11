import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/authContext';
import { CategoryProvider } from './context/CategoryContext';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <AuthProvider>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </AuthProvider>
);
