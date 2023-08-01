import React from "react";
import Header from "./header";
import ParticlesComponent from "./ParticlesComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children }) => {
  console.log("UPADTED!!!");

  return (
    <>
      <Header />
      <ToastContainer />
      <main>
        <ParticlesComponent />
        {children}
      </main>
      <style jsx>{`
        main {
          position: relative;
          background: #303030;
          height: 100vh;
        }
      `}</style>
    </>
  );
};

export default Layout;
