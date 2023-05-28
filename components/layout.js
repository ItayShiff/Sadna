import React from "react";
import Header from "./header";
import ParticlesComponent from "./ParticlesComponent";

const Layout = ({ children }) => {
  console.log("UPADTED!!!");

  return (
    <>
      <Header />
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
