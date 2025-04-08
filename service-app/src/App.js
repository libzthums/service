import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./layout/sidebar";
import Header from "./layout/header";
import Footer from "./layout/footer";
import Main from "./components/main";
import InsertData from "./components/insertData"
import DocDetail from "./components/docDetail"
import InsertDocData from "./components/insertDocData";
import UploadPage from "./components/uploadPage"
import Reissue from "./components/reIssue";

const App = () => {
  return (
    <div className="wrapper">
      <Header />
      <Sidebar />
      <div className="content-wrapper p-4">
        <Routes>
          <Route path="/reissuePage" element={<Reissue/>}/>
          <Route path="/uploadPage" element={<UploadPage/>}/>
          <Route path="/insertDocData" element={<InsertDocData/>}/>
          <Route path="/docDetail/:serviceID" element={<DocDetail/>}/>
          <Route path="/insert" element={<InsertData />}/>
          <Route path="/" element={<Main />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;