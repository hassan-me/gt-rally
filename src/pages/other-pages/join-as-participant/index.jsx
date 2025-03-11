import Agents from "@/components/common/Agents";
import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Features from "@/components/homes/rally-home/Features2";
import Banner from "@/components/otherPages/Banner";

import React from "react";

import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title: "GT Rally - Join As Participant"
};
export default function JoinAsParticipant() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <div className="header-fixed">
        <Header2 />
      </div>
      <Banner 
        heading={
          <span>
           Join the Rally<br/>
           Drive, Compete, Connect!
          </span>}
        description={
          <span>
            Be part of the ultimate car enthusiast community<br/>
            explore, engage, and experience thrilling rallies with GT Rally!
          </span>}
        />
      <div className="mt-5 pt-5"></div>
      <Features
        msg1 = "Punch line 1"
        msg2 = "Punch line 2"
        msg3 = "Punch line 3"
        title = "Experience the Rally as a Participant with Grand Touring Rally (GT Rally)!"
        desc = "Join a vibrant community of car enthusiasts and enjoy an unforgettable rally experience. Whether you're behind the wheel, navigating, or simply an admirer of car culture, GT Rally offers everything you need to make every event memorable."
        section1 = "Effortless Registration & Personalized Profiles"
        desc1 = "  Sign up quickly via the app or web and create a profile that showcases your <b>rally points, awards</b>, and even your custom garage of vehicles."
        section2 = "Discover and Join Car Events"
        desc2 = "Browse a comprehensive list of upcoming car meets, shows, and rallies. Access detailed event information—including maps, checkpoints, and logistics—to find the events that match your passion."
        section3 = "Real-Time Interaction & Engagement"
        desc3 = "Connect with fellow enthusiasts through live chat sessions and photo sharing during events. Capture every moment and share your experience with the community." 
        section4 = "Integrated Navigation for Seamless Rally Experiences"
        desc4 = "Enjoy built-in navigation that guides you through every drive and rally, ensuring you never miss a detail or turn." 
        section5 = "Community Connection"
        desc5 = "Engage directly with event organizers and other participants to share experiences, insights, and the thrill of the rally." 
        bottomMsg = "Download Grand Touring Rally (GT Rally) today and take the driver's seat of your next great adventure!"
      />
      <Footer1 />
    </>
  );
}
