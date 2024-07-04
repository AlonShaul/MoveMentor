import React, { createContext, useContext } from 'react';

const ApiContext = createContext();
export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  let apiUrl = '';

  try {
    if (process.env.RENDER) {
      apiUrl = 'https://movementor-fyyf.onrender.com';
    } else {
      throw new Error('No URL');
    }
  } catch {
    apiUrl = 'http://localhost:8800';
  }

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
