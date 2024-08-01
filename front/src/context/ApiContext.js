import React, { createContext, useContext } from 'react';

const ApiContext = createContext();
export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  let apiUrl = '';
  if (process.env.NODE_ENV === 'production'){
    apiUrl = 'https://movementor-fyyf.onrender.com';
  }
      apiUrl = 'http://localhost:8800'

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
