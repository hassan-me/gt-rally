//import { carData, rallyData } from "@/data/cars";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Link } from "react-router-dom";
import { EventType } from "@/constants";
import { useEffect, useState } from "react";
import Rally from './Rally';
import Event from './Event';



export default function Cars() {
  const swiperOptions = {
    speed: 1000,
    spaceBetween: 30,
    pagination: {
      el: ".spd11",
      clickable: true,
    },
    navigation: {
      nextEl: ".snbn8",
      prevEl: ".snbp8",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      991: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  };


  const [selectedType, setSelectedType] = useState(EventType.All);
  const [rallies, setRallies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const GetFilteredResults = () => {
    if (selectedType.type == EventType.All.type) return rallies;
    return rallies.filter(a => a.type == selectedType.type);
  }

  useEffect(() => {
    fetch("https://gt-rally.web.app/v1/events_web/public")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch rallies.");
        }
        return response.json()
      })
      .then((data) => {
        setRallies(data.map(rec => {
          rec.thumbnail = JSON.parse(rec.thumbnail);
          rec.thumbnail_url = JSON.parse(rec.thumbnail_url);
          // if (rec.type_custom == EventType.Events.type) {
          //   if (rec.start_location) rec.start_location = JSON.parse(rec.start_location);
          //   if (rec.end_location) rec.end_location = JSON.parse(rec.end_location);
          //   if (rec.event_images) rec.event_images = JSON.parse(rec.event_images);
          // }
          return rec;
        }))
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading rallies...</p>;
  if (error) return <p>Error: {error}</p>;
  // return (
  //   <div>
  //     {JSON.stringify(rallies)}
  //   </div>
  // )

  // return (
  //   <div>
  //     <h2>Upcoming Rallies</h2>
  //     <ul style={{ listStyle: "none", padding: 0 }}>
  //       {rallyData.map((rally) => (
  //         <li key={rally.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
  //           <img src={rally.thumbnail_url} alt={rally.name} style={{ width: "100%", maxWidth: "300px", borderRadius: "8px" }} />
  //           <h3>{rally.name}</h3>
  //           <p><strong>Type:</strong> {rally.type}</p>
  //           <p><strong>Start:</strong> {new Date(rally.start_date).toLocaleDateString()}</p>
  //           <p><strong>From:</strong> {rally.start_mapbox_district} → {rally.end_mapbox_district}</p>
  //           <a href={rally.share_link} target="_blank" rel="noopener noreferrer">View Rally</a>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );

  return (
    <section className="tf-section3">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="heading-section flex align-center justify-space flex-wrap gap-20">
              <h2
                className="wow fadeInUpSmall"
                data-wow-delay="0.2s"
                data-wow-duration="1000ms"
              >
               Top Picks: Rally Cars & Thrilling Events
              </h2>
              <Link
                to={`/blog-grid`}
                className="tf-btn-arrow wow fadeInUpSmall"
                data-wow-delay="0.2s"
                data-wow-duration="1000ms"
              >
                View all
                <i className="icon-autodeal-btn-right" />
              </Link>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="flat-tabs themesflat-tabs">
              <div className="box-tab center">
                <ul className="menu-tab tab-title style flex">
                  {Object.keys(EventType).map((eventType) => (
                    <li
                      key={eventType}
                      onClick={() => setSelectedType(EventType[eventType])}
                      className={`item-title ${
                        selectedType.label === eventType ? "active" : ""
                      }`}
                    >
                      <h5 className="inner">{EventType[eventType].label}</h5>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="content-tab">
                <div className="content-inner tab-content">
                  <Swiper
                    {...swiperOptions}
                    modules={[Pagination, Navigation]}
                    className="swiper-container tf-sw-mobile3"
                  >
                    {GetFilteredResults().map((record, i) => (
                      <SwiperSlide key={i} className="swiper-slide">
                        {record.type == EventType.CAR_MEETS.type ? <Event event={record} /> : <Rally rally={record}/> }
                      </SwiperSlide>
                    ))}
                    <div className="swiper-pagination5 spd11"></div>
                  </Swiper>
                  <div className="swiper-button-next style-1 snbn8" />
                  <div className="swiper-button-prev style-1 snbp8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
