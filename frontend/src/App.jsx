// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Demo from"./Demo";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import StaffHome from "./pages/staff/StaffHome";
// import ManagerHome from "./pages/manager/ManagerHome";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Customer Home Page */}
        <Route path="/" element={<Demo />} />

        {/* Future Routes */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/staff/home" element={<StaffHome />} /> */}
        {/* <Route path="/manager/home" element={<ManagerHome />} /> */}

        {/* Catch-all route for 404 */}
        <Route path="*" element={<h1 className="text-center mt-20 text-3xl">404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
