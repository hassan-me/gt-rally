import CarDetails4 from "@/components/carDetails/CarDetails4";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EventDetails from "@/components/eventDetails/EventDetails4";
import { allCars } from "@/data/cars";
import { ClipLoader } from 'react-spinners';
import MetaComponent from "@/components/common/MetaComponent";
const metadata = {
  title:
    "Car Details 04 || AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
  description: "AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
};
export default function EventDetail() {
  let params = useParams();
  const carItem = allCars.filter((elm) => elm.id == params.id)[0] || allCars[0];
  const [singleEvent, setSingleEvent] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://gtrally.web.app/v1/events_web/${params.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch detail.");
        }
        return response.json();
      })
      .then((data) => {
        setSingleEvent(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

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
      {loading ? (
  <div className="flex justify-center items-center h-64 mb-5">
    <ClipLoader size={60} color="#3B82F6" loading={loading} />
  </div>
) : (
  <EventDetails eventDetail={singleEvent} />
)}


      <Footer1 />
    </>
  );
}
