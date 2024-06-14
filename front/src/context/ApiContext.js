import React, { createContext, useContext } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const apiUrl = process.env.RENDER_API ? process.env.RENDER_API: 'http://localhost:8800'; // Ensure this URL is correct

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
