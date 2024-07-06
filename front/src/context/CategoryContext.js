import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([
      'בטן',
      'ברך',
      'גב',
      'ירך',
      'כף יד',
      'כתפיים',
      'מרפקים',
      'צוואר',
      'קרסול'
      ]);   

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
