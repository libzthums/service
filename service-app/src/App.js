import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./layout/sidebar";
import Header from "./layout/header";
import Footer from "./layout/footer";
import Main from "./components/main";
import InsertData from "./components/insertData";
import DocDetail from "./components/docDetail";
import InsertDocData from "./components/insertDocData";
import UploadPage from "./components/uploadPage";
import Reissue from "./components/reIssue";
import TotalPage from "./components/totalPage";
import { UserProvider, useUser } from "./context/userContext";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Setting from "./components/setting";
import SettingDivision from "./components/settingDivision";
import SettingPermission from "./components/settingPermission";

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // Check if the user is logged in and the token is still valid
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // Decode the token and check expiration
  const token = localStorage.getItem("token"); // Using localStorage to store the token
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds

    // If the token is expired, clear the session and log out the user
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token"); // Remove token from localStorage
      navigate("/login"); // Redirect to login page
    }
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <div className="wrapper">
          <Header />
          <Sidebar />
          <div className="content-wrapper p-4">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Main />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/totalPage"
                element={
                  <ProtectedRoute>
                    <TotalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reissuePage"
                element={
                  <ProtectedRoute>
                    <Reissue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/uploadPage"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insertDocData"
                element={
                  <ProtectedRoute>
                    <InsertDocData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/docDetail/:serviceID"
                element={
                  <ProtectedRoute>
                    <DocDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insert"
                element={
                  <ProtectedRoute>
                    <InsertData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setting"
                element={
                  <ProtectedRoute>
                    <Setting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settingDivision"
                element={
                  <ProtectedRoute>
                    <SettingDivision />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settingPermission"
                element={
                  <ProtectedRoute>
                    <SettingPermission />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;
