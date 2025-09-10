import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Demo = () => {
  const handleLogout = () => {
    alert("Logged out!");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // fixed full screen height
        width: "100vw", // full screen width
        overflow: "hidden", // prevent scrollbars
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Navbar */}
      <Navbar isLoggedIn={true} onLogout={handleLogout} />

      {/* Middle content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2 style={{ fontSize: "24px", lineHeight: "32px" }}>
          👋 Demo Page (Navbar + Footer)
          <br />
          Desktop view only
        </h2>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Demo;
