import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Write from "./pages/Write";
import Home from "./pages/Home";
import Single from "./pages/Single";
import UserProfile from "./pages/UserProfile";
import GeneratePlan from "./pages/GeneratePlan"; // Import the GeneratePlan component
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategorySelection from "./pages/CategorySelection";
import { AuthProvider } from "./context/authContext";
import { CategoryProvider } from "./context/CategoryContext";
import { ApiProvider } from "./context/ApiContext";
import PrivateRoute from "./components/PrivateRoute"; // Adjust import path
import ChatWidget from "./components/ChatWidget"; // Import ChatWidget component
import "./style.scss";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <ChatWidget /> {/* Add ChatWidget here */}
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
        path: "/generate-plan", // Add this route for GeneratePlan
        element: (
          <PrivateRoute>
            <GeneratePlan />
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
