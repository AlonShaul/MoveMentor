import React, { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  let url =  'http://localhost:8800' 
  const [apiUrl] = useState(`${url}`);

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
