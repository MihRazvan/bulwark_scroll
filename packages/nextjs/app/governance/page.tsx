"use client";

import { NextPage } from "next";
import Header from "~~/components/Header";
import Sidebar from "~~/components/Sidebar";

const Governance: NextPage = () => {
  return (
    <div className="flex min-h-screen bg-brand-background text-white">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header title="Governance" subtitle="Overview" />
        {/* Content */}
        <main className="flex-1 p-6 bg-black">portfolio</main>
      </div>
    </div>
  );
};

export default Governance;
