import DashBoard from "@/components/rally-dashboard/DashBoard";
import Sidebar from "@/components/rally-dashboard/Sidebar";
import Header4 from "@/components/rally-headers/Header4";
import React from "react";

import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title:
    "Dashboard || AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
  description: "AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
};
export default function DashboardPage() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Sidebar />
      <div id="wrapper-dashboard">
        <div id="pagee" className="clearfix">
          <Header4 />
        </div>
        <div id="themesflat-content"></div>
        <div className="dashboard-toggle">Show DashBoard</div>
        <DashBoard />
      </div>
    </>
  );
}
