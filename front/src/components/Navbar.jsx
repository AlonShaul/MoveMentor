import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../img/logo.png";
import { AuthContext } from "../context/authContext";
import { useCategories } from "../context/CategoryContext";
import '@fortawesome/fontawesome-free/css/all.css'; // Import FontAwesome

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isInjuryOpen, setIsInjuryOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setDarkMode(theme === 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');  // Redirect to login page after logout
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsInjuryOpen(false); // Ensure Injury Areas submenu is closed when toggling the sidebar
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setIsInjuryOpen(false);
  };

  const toggleInjury = () => {
    setIsInjuryOpen(!isInjuryOpen);
  };

  const handleCategoryClick = () => {
    setIsOpen(false);
    setIsInjuryOpen(false);
  };

  const toggleDarkMode = () => {
    const newMode = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newMode);
    localStorage.setItem('theme', newMode);
  };

  return (
    <div className="navbar fixed w-full z-10 top-4 h-20 text-gray-900 dark:text-white bg-transparent font-bold">
      <div className="container mx-auto px-2 flex justify-between items-center h-full">
        <div className="flex items-center space-x-8">
          <div className="logo">
            <Link to="/about">
              <img src={Logo} alt="Logo" className="h-20" />
            </Link>
          </div>
          {currentUser && (
            <>
              <Link className="link" to="/profile">
                <span className="user whitespace-nowrap">
                  {currentUser.username}
                  <i className="fas fa-user ml-2"></i>
                </span>
              </Link>
              <span onClick={handleLogout} className="cursor-pointer ml-4">Logout</span>
              <div onClick={toggleDarkMode} className={`ml-4 relative toggle ${darkMode ? 'dark' : ''}`}>
                <i className={`fas ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
              </div>
            </>
          )}
        </div>
        <div className="hidden md:flex space-x-4 items-center">
          {currentUser && currentUser.role === 'admin' && (
            <Link className="link" to="/write">
              <span className="write ml-4">כתוב פוסט</span>
            </Link>
          )}
          {currentUser && currentUser.role === 'admin' && (
            <Link className="link" to="/dashboard">
              <h6 className="capitalize">דשבורד</h6>
            </Link>
          )}
          <Link className="link" to="/" key="about">
            <h6 className="capitalize">כל התרגילים</h6>
          </Link>
          <Link className="link" to="/generate-plan" key="plan">
            <h6 className="capitalize">בניית תוכנית</h6>
          </Link>
          <div className="relative">
            <button className="link capitalize" key="injury" onClick={toggleInjury}>
              איזורי פציעה
              <i className={`fas fa-caret-${isInjuryOpen ? 'up' : 'down'} ml-2`}></i>
            </button>
            {isInjuryOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-lg text-right">
                {categories.map((item) => (
                  <Link
                    className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                    to={`/?cat=${item}`}
                    key={item}
                    onClick={handleCategoryClick}
                  >
                    <h6 className="capitalize">{item}</h6>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link className="link" to="/about" key="home">
            <h6 className="capitalize">דף הבית</h6>
          </Link>
        </div>
        <div className="md:hidden flex items-center space-x-4">
          <button onClick={toggleSidebar} className="text-gray-800 dark:text-white focus:outline-none">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="fixed inset-0 flex z-0">
          <div className="bg-black bg-opacity-50 flex-grow" onClick={closeSidebar}></div>
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64 h-full shadow-md p-4 overflow-y-auto">
            <button onClick={toggleSidebar} className="text-gray-800 dark:text-white focus:outline-none mb-4">
              <i className="fas fa-times"></i>
            </button>
            <div className="flex flex-col space-y-4">
              <Link className="link" to="/about" onClick={toggleSidebar}>
                דף הבית
              </Link>
              <div className="relative">
                <button className="link capitalize" key="injury" onClick={toggleInjury}>
                  איזורי פציעה
                  <i className={`fas fa-caret-${isInjuryOpen ? 'up' : 'down'} ml-2`}></i>
                </button>
                {isInjuryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-lg">
                    {categories.map((item) => (
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                        to={`/?cat=${item}`}
                        key={item}
                        onClick={handleCategoryClick}
                      >
                        <h6 className="capitalize">{item}</h6>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link className="link" to="/generate-plan" onClick={toggleSidebar}>
                בניית תוכנית
              </Link>
              <Link className="link" to="/" onClick={toggleSidebar}>
                כל התרגילים
              </Link>
              {currentUser && currentUser.role === 'admin' && (
                <>
                  <Link className="link" to="/dashboard" onClick={toggleSidebar}>
                    דשבורד
                  </Link>
                  <Link className="link" to="/write" onClick={toggleSidebar}>
                    כתוב פוסט
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
