import { Link } from "react-router-dom";

import { useEffect, useReducer, useState } from "react";
import { initialState, reducer } from "@/reducer/carFilterReducer";
import { allCars } from "@/data/cars";
import DropdownSelect from "../common/DropDownSelect";
import FilterSidebar from "./FilterSidebar";
import PaginationComponent from "../common/Pagination";
import ListGridToggler from "./ListGridToggler";
import ListingMap from "./ListingMap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
export default function Cars4() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    price,
    km,
    year,
    body,
    make,
    model,
    fuel,
    transmission,
    location,
    door,
    cylinder,
    color,

    features,
    filtered,
    sortingOption,
    sorted,
    currentPage,
    itemPerPage,
  } = state;

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),
    setYear: (value) => dispatch({ type: "SET_YEAR", payload: value }),
    setModel: (value) => dispatch({ type: "SET_MODEL", payload: value }),
    setKM: (value) => dispatch({ type: "SET_KM", payload: value }),
    setBody: (value) => dispatch({ type: "SET_BODY", payload: value }),
    setMake: (value) => dispatch({ type: "SET_MAKE", payload: value }),
    setFuel: (value) => dispatch({ type: "SET_FUEL", payload: value }),
    setTransmission: (value) =>
      dispatch({ type: "SET_TRANSMISSION", payload: value }),
    setLocation: (value) => dispatch({ type: "SET_LOCATION", payload: value }),
    setDoor: (value) => dispatch({ type: "SET_DOOR", payload: value }),
    setCylinder: (value) => dispatch({ type: "SET_CYLINDER", payload: value }),
    setColor: (value) => dispatch({ type: "SET_COLOR", payload: value }),

    setFeatures: (newFeature) => {
      const updated = [...features].includes(newFeature)
        ? [...features].filter((elm) => elm != newFeature)
        : [...features, newFeature];
      dispatch({ type: "SET_FEATURES", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 }),
        dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
  };

  const clearFilter = () => {
    dispatch({ type: "CLEAR_FILTER" });
  };

  useEffect(() => {
    let filteredArrays = [];

    if (features.length) {
      const filteredByFeatures = [...allCars].filter((elm) =>
        features.every((el) => elm.features.includes(el))
      );
      filteredArrays = [...filteredArrays, filteredByFeatures];
    }
    if (body !== "Any Body") {
      const filteredBybody = [...allCars].filter((elm) => body === elm.body);
      filteredArrays = [...filteredArrays, filteredBybody];
    }
    if (make !== "Any Make") {
      const filteredBymake = [...allCars].filter((elm) => make === elm.make);
      filteredArrays = [...filteredArrays, filteredBymake];
    }
    if (model !== "Any Model") {
      const filteredBymodel = [...allCars].filter((elm) => model === elm.model);
      filteredArrays = [...filteredArrays, filteredBymodel];
    }
    if (fuel !== "Any Fuel") {
      const filteredByfuel = [...allCars].filter(
        (elm) => fuel === elm.fuelType
      );
      filteredArrays = [...filteredArrays, filteredByfuel];
    }
    if (transmission !== "Any Transmission") {
      const filteredByTransmission = [...allCars].filter(
        (elm) => transmission === elm.transmission
      );
      filteredArrays = [...filteredArrays, filteredByTransmission];
    }
    if (location !== "Any Location") {
      const filteredBylocation = [...allCars].filter(
        (elm) => location === elm.location
      );
      filteredArrays = [...filteredArrays, filteredBylocation];
    }
    if (door !== "Any Door") {
      const filteredBydoor = [...allCars].filter(
        (elm) => parseInt(door.match(/\d+/)[0], 10) === elm.door
      );
      filteredArrays = [...filteredArrays, filteredBydoor];
    }
    if (cylinder !== "Any Cylinder") {
      const filteredBycylinder = [...allCars].filter(
        (elm) => parseInt(cylinder.match(/\d+/)[0], 10) === elm.cylinder
      );
      filteredArrays = [...filteredArrays, filteredBycylinder];
    }
    if (color !== "Any Color") {
      const filteredBycolor = [...allCars].filter((elm) => color === elm.color);
      filteredArrays = [...filteredArrays, filteredBycolor];
    }

    const filteredByPrice = [...allCars].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];
    const filteredBykm = [...allCars].filter(
      (elm) => elm.km >= km[0] && elm.km <= km[1]
    );
    filteredArrays = [...filteredArrays, filteredBykm];
    const filteredByyear = [...allCars].filter(
      (elm) => elm.year >= year[0] && elm.year <= year[1]
    );
    filteredArrays = [...filteredArrays, filteredByyear];

    const commonItems = [...allCars].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [
    price,
    km,
    year,
    body,
    make,
    model,
    fuel,
    transmission,
    location,
    door,
    cylinder,
    color,

    features,
  ]);

  useEffect(() => {
    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
    }
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);
  const [isGrid, setIsGrid] = useState(true);
  return (
    <>
      <div className="wrap-map flat-featured listing-grid style flex listing-wrap-map">
        <div className="content-left wg-dream sidebar-left-listing listing-list-car-wrap">
          <div className="category-filter flex justify-space align-center mb-30 flex-wrap gap-20">
            <div className="box-1">
              <h2 className="heading-listing">Used cars for sale</h2>
            </div>
            <div className="box-2 flex flex-wrap gap-8">
              <ListGridToggler isGrid={isGrid} setIsGrid={setIsGrid} />
              <div className="wd-find-select flex flex-wrap gap-20">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={sortingOption}
                    onChange={allProps.setSortingOption}
                    addtionalParentClass="list-sort"
                    options={[
                      "Sort by (Default)",

                      "Price Ascending",
                      "Price Descending",
                    ]}
                  />
                </div>
              </div>
              <a
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasRight"
                aria-controls="offcanvasRight"
                className="filter"
              >
                Filter
                <i className="icon-autodeal-filter" />
              </a>
            </div>
          </div>
          <div
            className={`list-car-1 list-car-list-1 map-listing-car ${
              isGrid ? "list-car-grid-1" : ""
            } `}
          >
            {sorted.length ? (
              <>
                {sorted
                  .slice((currentPage - 1) * 4, currentPage * 4)
                  .map((car, i) => (
                    <div key={i} className="box-car-list hv-one">
                      <div className="image-group relative">
                        <div className="top flex-two">
                          <ul className="d-flex gap-8">
                            <li className="flag-tag success">Featured</li>
                            <li className="flag-tag style-1">
                              <div className="icon">
                                <svg
                                  width={16}
                                  height={13}
                                  viewBox="0 0 16 13"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M1.5 9L4.93933 5.56067C5.07862 5.42138 5.24398 5.31089 5.42597 5.2355C5.60796 5.16012 5.80302 5.12132 6 5.12132C6.19698 5.12132 6.39204 5.16012 6.57403 5.2355C6.75602 5.31089 6.92138 5.42138 7.06067 5.56067L10.5 9M9.5 8L10.4393 7.06067C10.5786 6.92138 10.744 6.81089 10.926 6.7355C11.108 6.66012 11.303 6.62132 11.5 6.62132C11.697 6.62132 11.892 6.66012 12.074 6.7355C12.256 6.81089 12.4214 6.92138 12.5607 7.06067L14.5 9M2.5 11.5H13.5C13.7652 11.5 14.0196 11.3946 14.2071 11.2071C14.3946 11.0196 14.5 10.7652 14.5 10.5V2.5C14.5 2.23478 14.3946 1.98043 14.2071 1.79289C14.0196 1.60536 13.7652 1.5 13.5 1.5H2.5C2.23478 1.5 1.98043 1.60536 1.79289 1.79289C1.60536 1.98043 1.5 2.23478 1.5 2.5V10.5C1.5 10.7652 1.60536 11.0196 1.79289 11.2071C1.98043 11.3946 2.23478 11.5 2.5 11.5ZM9.5 4H9.50533V4.00533H9.5V4ZM9.75 4C9.75 4.0663 9.72366 4.12989 9.67678 4.17678C9.62989 4.22366 9.5663 4.25 9.5 4.25C9.4337 4.25 9.37011 4.22366 9.32322 4.17678C9.27634 4.12989 9.25 4.0663 9.25 4C9.25 3.9337 9.27634 3.87011 9.32322 3.82322C9.37011 3.77634 9.4337 3.75 9.5 3.75C9.5663 3.75 9.62989 3.77634 9.67678 3.82322C9.72366 3.87011 9.75 3.9337 9.75 4Z"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              6
                            </li>
                          </ul>
                          <div className="year flag-tag">{car.year}</div>
                        </div>

                        <Swiper
                          modules={[Pagination]}
                          pagination={{ el: `.spd${i}`, clickable: true }}
                          className="swiper-container carousel-2 img-style"
                        >
                          {[car.imgSrc, car.imgSrc, car.imgSrc].map(
                            (elm2, i2) => (
                              <SwiperSlide key={i2} className="swiper-slide">
                                <img
                                  className="lazyload"
                                  alt="image"
                                  src={elm2}
                                  width={615}
                                  height={462}
                                />
                              </SwiperSlide>
                            )
                          )}

                          <div className="pagi2">
                            <div className={` swiper-pagination2 spd${i}`} />
                          </div>
                        </Swiper>
                      </div>
                      <div className="content">
                        <div className="text-address">
                          <p className="text-color-3 font">{car.type}</p>
                        </div>
                        <h5 className="link-style-1">
                          <Link to={`/listing-detail-v1/${car.id}`}>
                            {car.title}
                          </Link>
                        </h5>
                        <div className="icon-box flex flex-wrap">
                          <div className="icons flex-three">
                            <i className="icon-autodeal-km1" />
                            <span>{car.km.toLocaleString()} kms</span>
                          </div>
                          <div className="icons flex-three">
                            <i className="icon-autodeal-diesel" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="icons flex-three">
                            <i className="icon-autodeal-automatic" />
                            <span>{car.transmission}</span>
                          </div>
                        </div>
                        <div className="money fs-20 fw-5 lh-25 text-color-3">
                          ${car.price.toLocaleString()}
                        </div>
                        <div className="days-box flex justify-space align-center">
                          <div className="img-author">
                            <img
                              className="lazyload"
                              alt="image"
                              src={car.authorImage}
                              width={120}
                              height={120}
                            />
                            <span className="font text-color-2 fw-5">
                              {car.authorName}
                            </span>
                          </div>
                          <Link
                            to={`/listing-detail-v1/${car.id}`}
                            className="view-car"
                          >
                            View car
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div style={{ fontSize: "16px" }}>
                No items found . Please try another filter
              </div>
            )}
          </div>
          <div className="themesflat-pagination clearfix mt-40">
            <ul>
              <PaginationComponent
                currentPage={currentPage}
                setPage={(value) => allProps.setCurrentPage(value)}
                itemLength={sorted.length}
                itemPerPage={4}
              />
            </ul>
          </div>
        </div>
        <div className="content-right fixed-space po-sticky">
          <div id="map" className="row-height">
            <ListingMap />
          </div>
        </div>
      </div>
      <FilterSidebar clearFilter={clearFilter} allProps={allProps} />
    </>
  );
}
