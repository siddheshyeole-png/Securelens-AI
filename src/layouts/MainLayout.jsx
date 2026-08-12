import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-zinc-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      <main className="flex-1 bg-[#09090B]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
