import Header from "./header";
import Footer from "./footer";
import React from "react";

interface PropsType {
  children: React.ReactNode;
}

const Layout = ({ children }: PropsType) => {
  return (
    <>
      <Header />
      <main className="relative z-10 h-[80%] flex items-center justify-center">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
