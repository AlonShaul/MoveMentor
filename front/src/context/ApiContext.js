import React, { createContext, useContext } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8800';

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
