import Agents from "@/components/common/Agents";
import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Features from "@/components/homes/rally-home/Features2";
import Banner from "@/components/otherPages/Banner";

import React from "react";

import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title: "GT Rally - Download the mobile App"
};
export default function MobileApp() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <div className="header-fixed">
        <Header2 />
      </div>
      <Banner 
        heading={
          <span>
           GT Rally Mobile App<br/>
           Your Ultimate Rally Companion!
          </span>}
        description={
          <span>
            Plan, join, and experience car rallies like never before with<br/> 
            real-time navigation, event management, and community engagement<br/>
            all in one powerful app! 
          </span>}
        />
      <div className="mt-5 pt-5"></div>
      <Features
        msg1 = "Punch line 1"
        msg2 = "Punch line 2"
        msg3 = "Punch line 3"
        title = "Rev Up Your Road Rally Experience with Grand Touring Rally (GT Rally)!"
        desc = "GT Rally is your all-in-one mobile solution designed for car enthusiasts and event managers alike. Whether you're planning a rally, a car meet, or a show, our app puts everything you need right at your fingertips."
        section1 = "Seamless Account Creation"
        desc1 = " Create your personalized profile via the app or web and showcase your custom garage of vehicles."
        section2 = "Plan, Create & Manage Events"
        desc2 = " Organize comprehensive events with ease. Whether you're hosting a rally, car meet, or show, manage event details such as start locations, checkpoints, points of interest, and maps. Coordinate teams, participants, vehicles, and logistics (including hotel and stop details) all within one platform."
        section3 = "Real-Time Communication & Engagement"
        desc3 = "Stay connected during events with in-app chat sessions and instant photo sharing. Sponsors participating in events also gain exclusive access to these chats and photos, fostering deeper community engagement."
        section4 = "Integrated Event Logistics"
        desc4 = "From invitation to managing attendance, GT Rally ensures every detail is covered so you can focus on the excitement of the event."
        bottomMsg = "Download Grand Touring Rally (GT Rally) today and drive your passion further—because your next car event should be as dynamic and well-organized as you are!"
      />
      <Footer1 />
    </>
  );
}
