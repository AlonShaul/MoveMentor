import React, { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  let url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : 'http://localhost:8800' 
  const [apiUrl] = useState(`${url}`);

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
