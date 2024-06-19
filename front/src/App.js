import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Write from "./pages/Write";
import Home from "./pages/Home";
import Single from "./pages/Single";
import UserProfile from "./pages/UserProfile";
import GeneratePlan from "./pages/GeneratePlan";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategorySelection from "./pages/CategorySelection";
import { AuthProvider } from "./context/authContext";
import { CategoryProvider } from "./context/CategoryContext";
import { ApiProvider } from "./context/ApiContext";
import PrivateRoute from "./components/PrivateRoute"; 
import "./style.scss";
import backgroundImage from "./img/wp7935249.jpg";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
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
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/post/:id",
        element: (
          <PrivateRoute>
            <Single />
          </PrivateRoute>
        ),
      },
      {
        path: "/write",
        element: (
          <PrivateRoute>
            <Write />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "/select-category",
        element: (
          <PrivateRoute>
            <CategorySelection />
          </PrivateRoute>
        ),
      },
      {
        path: "/generate-plan",
        element: (
          <PrivateRoute>
            <GeneratePlan />
          </PrivateRoute>
        ),
      },
      {
        path: "/about",
        element: (
          <PrivateRoute>
            <About />
          </PrivateRoute>
        ),
      },
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
