import React, { createContext, useContext } from 'react';

const ApiContext = createContext();
export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  let apiUrl = '';
      apiUrl = 'https://movementor-fyyf.onrender.com';

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};
