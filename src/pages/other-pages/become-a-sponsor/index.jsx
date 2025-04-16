import Agents from "@/components/common/Agents";
import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Features from "@/components/homes/rally-home/Features2";
import Banner from "@/components/otherPages/Banner";
import SponsorForm from "@/components/otherPages/SponsorForm";

import React from "react";

import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title: "GT Rally - Become a sponsor"
};
export default function BecomeASponsor() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <div className="header-fixed">
        <Header2 />
      </div>
      <Banner 
        heading={
          <span>
           Fuel Your Brand’s Momentum with <br/>
           GT Rally!
          </span>}
        description={
          <span>
            Get in the fast lane—sponsor epic rallies, connect with die-hard car enthusiasts, <br/>
            and put your brand in pole position at GT Rally!
          </span>}
        />
      <div className="mt-5 pt-5"></div>
      <Features
        msg1 = "Punch line 1"
        msg2 = "Punch line 2"
        msg3 = "Punch line 3"
        title = {<span>Welcome to Grand Touring Rally (GT Rally) <br/> The Ultimate Hub for Car Event Enthusiasts and Sponsors!</span>}
        desc = "Our website is the central meeting point for discovering and engaging with car events. Whether you're a participant, organizer, or sponsor, GT Rally's online platform brings the community together."
        section1 = "Explore Upcoming Events"
        desc1 = "Browse a comprehensive calendar of car meets, shows, and rallies. View detailed event information including maps, routes, checkpoints, and logistics that enhance your event experience."
        section2 = "Exclusive Member Benefits"
        desc2 = " Authenticated users access advanced event planning tools, personalized profiles, and the ability to manage their own participation and vehicle details."
        section3 = "Sponsor Showcase and Participation"
        desc3 = "Sponsors receive dedicated profiles with key information and direct links to their websites. Additionally, sponsors can participate in events to access exclusive event photos and live chat sessions, enabling direct engagement with rally attendees."
        section4 = "Vibrant Community Engagement"
        desc4 = "Beyond event discovery, our platform fosters a dynamic community where car enthusiasts share experiences, post images, and interact via live chats during events."
     //   bottomMsg = "Visit Grand Touring Rally (GT Rally) online today and be part of a movement that's redefining the car event experience for all—participants, organizers, and sponsors alike."
      />
      <SponsorForm/>
      <Footer1 />
    </>
  );
}
