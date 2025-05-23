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
import SettingType from "./components/settingType";
import SummaryPage from "./components/summaryPage";

/**
 * The ProtectedRoute component checks user authentication status and redirects to the login page if
 * necessary before rendering its children.
 * @returns The ProtectedRoute component returns the children components if the user is authenticated
 * and not loading. If the user is not authenticated, it will navigate to the login page. If the token
 * has expired, it will remove the token from localStorage and navigate to the login page. If the
 * loading state is true, it will display a "Loading..." message.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      navigate("/login");
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
                path="/total"
                element={
                  <ProtectedRoute>
                    <TotalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reissue"
                element={
                  <ProtectedRoute>
                    <Reissue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload/excel"
                element={
                  <ProtectedRoute>
                    <InsertDocData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/document/:serviceID"
                element={
                  <ProtectedRoute>
                    <DocDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload/manual"
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
                path="/setting/division"
                element={
                  <ProtectedRoute>
                    <SettingDivision />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setting/permission"
                element={
                  <ProtectedRoute>
                    <SettingPermission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setting/type"
                element={
                  <ProtectedRoute>
                    <SettingType />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/summary"
                element={
                  <ProtectedRoute>
                    <SummaryPage />
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
