import React, { useEffect, useState, useMemo } from "react";
import { Search, Edit, Trash2, Car } from "lucide-react";
import {
  useGetGarageQuery,
  useDeleteGarageMutation,
  useCreateUpdateGarageMutation,
} from "../../redux/slices/api.slice";

import MyGarage from "../modals/MyGarage";
import { getImage } from "@/utlis/helpers";
import Pagination2 from "../common/Pagination2";
import DropdownSelect from "../common/DropDownSelect";
import { errorToast, successToast } from "../common/Toast";

export default function DashBoard() {
  const { data: garageData, isLoading, refetch } = useGetGarageQuery();
  const [deleteGarage, { isLoading: isDeleting }] = useDeleteGarageMutation();
  const [createUpdateGarage, { isLoading: isLoadingGarageCreation }] =
    useCreateUpdateGarageMutation();

  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editGarageData, setEditGarageData] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGarageModal, setShowGarageModal] = useState(false);

  useEffect(() => {
    if (garageData && Array.isArray(garageData)) {
      setVehicles(garageData);
    }
  }, [garageData]);

  const makeMap = useMemo(() => {
    const rawMakes = [...new Set(vehicles.map((v) => v.make))];
    return {
      All: null,
      ...Object.fromEntries(rawMakes.map((mk) => [mk, mk])),
    };
  }, [vehicles]);

  useEffect(() => {
    const filterdata = vehicles.filter((v) => {
      const makeMatch = selectedMake ? v.make === selectedMake : true;
      const text = `${v.name || ""} ${v.model || ""}`.toLowerCase();
      const searchMatch = text.includes(searchQuery.toLowerCase());
      return makeMatch && searchMatch;
    });
    setFilteredVehicles(filterdata);
  }, [selectedMake, vehicles, searchQuery]);

  const onDeleteVehicle = async (id) => {
    try {
      await deleteGarage(id).unwrap();
      setVehicles((prev) => prev.filter((e) => e.id !== id));
      refetch();
      successToast("Vehicle has been deleted");
    } catch (e) {
      errorToast("Error deleting vehicle");
    }
  };

  const onGarageCreate = async (formData) => {
    try {
      await createUpdateGarage(formData).unwrap();
      setShowGarageModal(false);
      if (editGarageData) {
        successToast("Garage Updated successfully!");
      } else {
        successToast("Garage created successfully!");
      }
    } catch (err) {
      errorToast("Garage creation failed. Please try again.");
    }
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="content-area">
              <main id="main" className="main-content">
                <div className="tfcl-dashboard">
                  <h1 className="admin-title">My Garage</h1>
                  <div className="tfcl-dashboard-overview">
                    <div className="row">
                      <div className="col-sm-6 col-xl-3">
                        <a className="tfcl-card" href="#">
                          <div className="card-body">
                            <div className="tfcl-icon-overview">
                              <Car size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Total Vehicles</h5>
                              <div className="tfcl-dashboard-title">
                                <div className="listing-text d-flex">
                                  <b>{vehicles?.length || 0} </b>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="tfcl-dashboard-middle mt-2">
                    <div className="row">
                      <div className="tfcl-dashboard-middle-left col-md-12">
                        <div className="tfcl-dashboard-listing">
                          <h5 className="title-dashboard-table">
                            Your Vehicles
                          </h5>

                          <div className="row align-items-center">
                            <div className="col-xl-3 col-lg-6 mb-2">
                              <div className="group-input-icon search">
                                <input
                                  type="text"
                                  name="title_search"
                                  id="title_search"
                                  defaultValue=""
                                  placeholder="Search..."
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                                <span className="datepicker-icon">
                                  <Search size={18} />
                                </span>
                              </div>
                            </div>
                            <div className="col-xl-3 col-lg-6 mb-2">
                              <DropdownSelect
                                addtionalParentClass="form-control"
                                defaultOption={"Select Make"}
                                options={Object.keys(makeMap)}
                                onChange={(value) => {
                                  setSelectedMake(makeMap[value]);
                                }}
                              />
                            </div>
                            <div className="col-xl-6 col-lg-12 mb-2 d-flex justify-content-end">
                              <button
                                type="button"
                                className="btn d-flex align-items-center"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowGarageModal(true);
                                  setEditGarageData(null);
                                }}
                                style={{
                                  backgroundColor: "#ff7102",
                                  color: "white",
                                  width: "200px",
                                  height: "52px",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "1.5rem",
                                    marginRight: "8px",
                                    lineHeight: 1,
                                  }}
                                >
                                  +
                                </span>
                                Add Vehicle
                              </button>
                            </div>
                          </div>
                          <div className="tfcl-table-listing">
                            <div className="table-responsive">
                              <span className="result-text">
                                <b>{vehicles?.length || 0}</b> results found
                              </span>
                              <table
                                className="table"
                                style={{ width: "100%" }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        textAlign: "center",
                                        width: "40%",
                                      }}
                                    >
                                      Vehicle
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Make
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Model
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Year
                                    </th>

                                    <th style={{ textAlign: "center" }}>
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="tfcl-table-content">
                                  {isLoading ? (
                                    <tr>
                                      <td colSpan="7" className="text-center">
                                        Loading...
                                      </td>
                                    </tr>
                                  ) : filteredVehicles &&
                                    filteredVehicles.length > 0 ? (
                                    filteredVehicles.map((vehicle) => (
                                      <tr key={vehicle.id}>
                                        <td className="column-listing">
                                          <div className="tfcl-listing-product">
                                            <img
                                              alt="Vehicle image"
                                              src={
                                                getImage(vehicle.imageName) ||
                                                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png"
                                              }
                                              width={168}
                                              height={95}
                                              style={{ objectFit: "cover" }}
                                            />
                                            <div
                                              className="tfcl-listing-summary"
                                              style={{ paddingTop: "3%" }}
                                            >
                                              <h4 className="tfcl-listing-title">
                                                {vehicle.name}
                                              </h4>
                                              <div className="features-text">
                                                {vehicle.make} • {vehicle.model}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                          }}
                                          className="column-date"
                                        >
                                          <div style={{ paddingTop: "25%" }}>
                                            {vehicle.make}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                          }}
                                          className="column-date"
                                        >
                                          <div className="tfcl-listing-date">
                                            {vehicle.model}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                          }}
                                          className="column-date"
                                        >
                                          <div className="tfcl-listing-date">
                                            {vehicle.year}
                                          </div>
                                        </td>

                                        <td
                                          className="column-controller"
                                          style={{ verticalAlign: "middle" }}
                                        >
                                          <div className="inner-controller">
                                            <span className="icon">
                                              <Edit size={16} />
                                            </span>{" "}
                                            <a
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setShowGarageModal(true);
                                                setEditGarageData(vehicle);
                                              }}
                                            >
                                              Edit
                                            </a>
                                          </div>

                                          <div className="inner-controller">
                                            <span className="icon">
                                              <Trash2 size={16} />
                                            </span>{" "}
                                            <a
                                              onClick={(e) => {
                                                e.preventDefault();
                                                if (!isDeleting) {
                                                  onDeleteVehicle(vehicle.id);
                                                }
                                              }}
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                              style={{
                                                position: "relative",
                                                pointerEvents: isDeleting
                                                  ? "none"
                                                  : "auto",
                                                opacity: isDeleting ? 0.6 : 1,
                                              }}
                                            >
                                              {isDeleting ? (
                                                <span
                                                  className="spinner-border spinner-border-sm me-1"
                                                  role="status"
                                                  aria-hidden="true"
                                                  style={{
                                                    verticalAlign: "middle",
                                                  }}
                                                ></span>
                                              ) : (
                                                "Delete"
                                              )}
                                            </a>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="7" className="text-center">
                                        No vehicles found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                            {/* <div className="themesflat-pagination clearfix mt-40">
                              <ul>
                                <Pagination2 />
                              </ul>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      {showGarageModal && (
        <div
          className="modal show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div
              className="modal-content"
              style={{
                height: "80vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="modal-body" style={{ overflowY: "auto" }}>
                <MyGarage
                  editGarageData={editGarageData}
                  isCreate
                  onClose={() => setShowGarageModal(false)}
                  onComplete={onGarageCreate}
                  isloading={isLoadingGarageCreation}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
