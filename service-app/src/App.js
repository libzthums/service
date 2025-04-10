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

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
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
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </UserProvider>
  );
};

export default App;
