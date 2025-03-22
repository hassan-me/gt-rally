import CarDetails4 from "@/components/carDetails/CarDetails4";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { Link, useParams } from "react-router-dom";
import EventDetails from "@/components/eventDetails/EventDetails4"
import { allCars } from "@/data/cars";
import { events } from "@/data/events";
import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title:
    "Car Details 04 || AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
  description: "AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
};
export default function EventDetail() {
  let params = useParams();
  const carItem = allCars.filter((elm) => elm.id == params.id)[0] || allCars[0];
  return (
    <>
      <MetaComponent meta={metadata} />
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title mb-40">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner style">
                <div className="title-group fs-12">
                  <Link className="home fw-6 text-color-3" to={`/`}>
                    Home
                  </Link>
                  <span>Event Details</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <EventDetails eventDetail={events[0]} />
      <Footer1 />
    </>
  );
}
