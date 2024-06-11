import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Write from "./pages/Write";
import Home from "./pages/Home";
import Single from "./pages/Single";
import UserProfile from "./pages/UserProfile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategorySelection from "./pages/CategorySelection"; // Import the new component
import { AuthProvider } from "./context/authContext";
import { CategoryProvider } from "./context/CategoryContext";
import { ApiProvider } from "./context/ApiContext";
import "./style.scss";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/post/:id", element: <Single /> },
      { path: "/write", element: <Write /> },
      { path: "/profile", element: <UserProfile /> },
      { path: "/select-category", element: <CategorySelection /> },
    ],
  },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
]);

function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <CategoryProvider>
          <div className="app flex flex-col min-h-screen">
            <RouterProvider router={router} />
          </div>
        </CategoryProvider>
      </AuthProvider>
    </ApiProvider>
  );
}

export default App;
