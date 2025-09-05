import CreateEvent from "@/components/rally-dashboard/CreateEvent";
import Sidebar from "@/components/rally-dashboard/Sidebar";
import Header4 from "@/components/rally-headers/Header4";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import MetaComponent from "@/components/common/MetaComponent";
import CreateCheckpoint from "@/components/rally-dashboard/CreateCheckpoint";

const metadata = {
  title:
    "Add Listing || AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
  description: "AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
};

export default function CreateEventPage() {
  const location = useLocation();

  const forceCreateEvent = Boolean(location?.state?.forceCreateEvent);
  const editRallyId = location?.state?.rallyId;

  const [renderCheckpointPage, setRenderCheckpointPage] = useState(false);
  const [rallyId, setRallyId] = useState(editRallyId || false);

  useEffect(() => {
    if (forceCreateEvent) {
      setRenderCheckpointPage(false);
    }
  }, [location, forceCreateEvent]);

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

        {renderCheckpointPage ? (
          <CreateCheckpoint
            rallyId={rallyId}
            isCreate
            goBack={() => {
              setRenderCheckpointPage(false);
              location.state = { ...location.state, forceCreateEvent: false };
            }}
          />
        ) : (
          <CreateEvent
            rallyId={editRallyId}
            forceCreateEvent={forceCreateEvent}
            onEventComplete={(newRallyId) => {
              setRenderCheckpointPage(true);
              setRallyId(newRallyId);
            }}
          />
        )}
      </div>
    </>
  );
}
