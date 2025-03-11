import Header1 from "@/components/headers/Header1";
import Events from "@/components/homes/rally-home/Events";
import Hero from "@/components/homes/rally-home/Hero";
import React from "react";
import FeaturedEvents from "@/components/homes/rally-home/FeaturedEvents";
import Agents from "@/components/common/Agents";
import DownloadApp from "@/components/common/DownloadApp";
import Features from "@/components/homes/rally-home/Features";
import Brands from "@/components/common/Brands";
import Testimonials from "@/components/homes/rally-home/Testimonials";
import Blogs from "@/components/common/Blogs3";
import Footer1 from "@/components/footers/Footer1";

import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title: "GT Rally Hub - Drive. Compete. Conquer.",
  description: "Discover and join thrilling rally events worldwide. Connect with racing enthusiasts, explore off-road adventures, and experience high-speed excitement. Find your next rally today!",
};
export default function RallyHome() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <div className="header-fixed">
        <Header1 />
      </div>
      <Hero />
      <div className="mt-5 pt-5"></div>
      <Events />
      <FeaturedEvents />
      <br/><br/>
      <DownloadApp />
      <div className="mt-5 pt-5"></div>
      <Features />
      <div className="mt-5 pt-5"></div>
      <Brands />
      <Testimonials />
      <Blogs parentClass="section-blog tf-section3" />
      <Agents />
      <Footer1 />
    </>
  );
}
