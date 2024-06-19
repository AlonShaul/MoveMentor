import React, { createContext, useContext } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const apiUrl = 'https://movementor-fyyf.onrender.com' ? 'https://movementor-fyyf.onrender.com' : 'http://localhost:8800'; 

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
