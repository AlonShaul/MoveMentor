import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([
  'כאבי גב',
  'כאבי צוואר',
  'כאבי כתף',
  'כאבי ברכיים',
  'כאבי ירך',
  'כאבי קרסול וכף רגל',
  'כאבי מרפק ושורש כף היד',
      ]);   

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
