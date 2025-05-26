import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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

// Layout for protected routes
const ServiceLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

// Layout for settings
const SettingLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <div className="wrapper">
          <Header />
          <Sidebar />
          <div className="content-wrapper p-4">
            <Routes>
              <Route path="/" element={<Navigate to="/service" replace />} />

              <Route path="/login" element={<Login />} />

              <Route path="/service" element={<ServiceLayout />}>
                <Route index element={<Main />} />
                <Route path="total" element={<TotalPage />} />
                <Route path="reissue" element={<Reissue />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="upload/excel" element={<InsertDocData />} />
                <Route path="upload/manual" element={<InsertData />} />
                <Route path="document/:serviceID" element={<DocDetail />} />
                <Route path="summary" element={<SummaryPage />} />

                <Route path="setting" element={<SettingLayout />}>
                  <Route index element={<Setting />} />
                  <Route path="division" element={<SettingDivision />} />
                  <Route path="permission" element={<SettingPermission />} />
                  <Route path="type" element={<SettingType />} />
                </Route>
              </Route>
            </Routes>
          </div>
          <Footer />
        </div>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;
