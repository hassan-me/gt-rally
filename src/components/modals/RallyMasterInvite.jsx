import React, { useState, useMemo, useEffect, useCallback, act } from "react";
import {
  useGetAllUsersQuery,
  useGetRallyInvitesQuery,
  useGetPreviousDriversQuery,
  useGetRallyParticipantsQuery,
  useSendInviteToDriversMutation,
  useAcceptOrRejectInviteMutation,
} from "@/redux/slices/api.slice";
import { errorToast, successToast } from "../common/Toast";
import { getImage } from "@/utlis/helpers";

export default function RallyMasterInviteModal({
  rallyId,
  show,
  onClose,
  noOfVehicles,
}) {
  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);
  const {
    data: invitesData,
    refetch: refetchRallyInvites,
    isLoading: invitesLoading,
  } = useGetRallyInvitesQuery(rallyId);
  const {
    data: participantsData,
    refetch: refetchParticipants,
    isLoading: participantsLoading,
  } = useGetRallyParticipantsQuery(rallyId);
  const {
    data: driversData,
    refetch: refetchDrivers,
    isLoading: driversLoading,
  } = useGetPreviousDriversQuery(rallyId);
  const {
    data: allUsersData,
    refetch: refetchAllUsers,
    isLoading: allUsersLoading,
  } = useGetAllUsersQuery(rallyId);

  const [sendInvite, { isLoading: sendingInvite, isSuccess: inviteSuccess }] =
    useSendInviteToDriversMutation();

  const [acceptOrRejectInvite, { isLoading: isDeleteLoading }] =
    useAcceptOrRejectInviteMutation();

  useEffect(() => {
    if (inviteSuccess) {
      setSelectedUserIds([]);
      refetchRallyInvites();
      refetchParticipants();
      refetchDrivers();
      refetchAllUsers();
    }
  }, [inviteSuccess]);

  const excludedEmails = useMemo(() => {
    const invitesEmails = invitesData
      ? invitesData.map((i) => i.user.email)
      : [];
    const participantsEmails = participantsData
      ? participantsData.map((p) => p.user.email)
      : [];
    return new Set([...invitesEmails, ...participantsEmails]);
  }, [invitesData, participantsData]);

  let currentUsers;
  if (activeTab === "users") {
    currentUsers = allUsersData;
  } else if (activeTab === "returning") {
    currentUsers = driversData;
  } else {
    currentUsers = participantsData;
  }

  const filteredUsers = useMemo(() => {
    if (!currentUsers) return [];
    const q = search.trim().toLowerCase();
    return currentUsers
      .filter((u) => {
        if (!q) return true;
        const fullName = `${u.firstName || ""} ${
          u.lastName || ""
        }`.toLowerCase();
        const username = (u.username || "").toLowerCase();
        return (
          fullName.includes(q) ||
          username.includes(q) ||
          (u.email || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [currentUsers, search]);

  const isUserExcluded = useCallback(
    (user) => excludedEmails.has(user.email),
    [excludedEmails]
  );

  const getId = (user) =>
    "userId" in user ? user.userId : "id" in user ? user.id : user.email;

  const toggleSelect = (user) => {
    const id = getId(user);
    if (isUserExcluded(user)) return;
    setSelectedUserIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const handleDelete = async (id) => {
    setDeletingUser(id);
    try {
      await acceptOrRejectInvite({ id, status: "deleted" });
      successToast("Participant Deleted Successfully!");
      refetchParticipants();
    } catch (e) {
      errorToast("Error Deleting Participant");
    }
    setDeletingUser(null);
  };

  const selectableUsers = useMemo(
    () => filteredUsers.filter((u) => !isUserExcluded(u)),
    [filteredUsers, isUserExcluded]
  );

  const handleSelectAll = () => {
    const allSelectableIds = selectableUsers.map(getId);
    const allSelected = allSelectableIds.every((id) =>
      selectedUserIds.includes(id)
    );
    setSelectedUserIds(allSelected ? [] : allSelectableIds);
  };

  const handleSendInvites = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await sendInvite({ rallyId, userIds: selectedUserIds }).unwrap();
      successToast("Invite Successfully Sent");
    } catch (err) {
      errorToast("Error Sending Invites");
    }
  };

  const isLoading =
    invitesLoading ||
    participantsLoading ||
    driversLoading ||
    allUsersLoading ||
    sendingInvite;

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      tabIndex={-1}
      style={{ display: "block" }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Manage Participants</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <ul className="nav nav-tabs mb-3" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "users" ? "active fw-bold" : ""}`}
                  type="button"
                  onClick={() => {
                    setActiveTab("users");
                    setSelectedUserIds([]);
                  }}
                  style={
                    activeTab === "users"
                      ? {
                        border: "2px solid #ff7102",
                          color: "white",
                          backgroundColor: "#ff7102",
                          borderRadius: 0,
                        }
                      : {color:"black"}
                  }
                >
                  Invite users
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "returning" ? "active fw-bold" : ""}`}
                  type="button"
                  onClick={() => {
                    setActiveTab("returning");
                    setSelectedUserIds([]);
                  }}
                  style={
                    activeTab === "returning"
                      ? {
                        border: "2px solid #ff7102",
                        color: "white",
                        backgroundColor: "#ff7102",
                        borderRadius: 0,
                        }
                      : {
                        color:"black"
                      }
                  }
                >
                  Invite From Previous rally drivers
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "Participants" ? "active fw-bold" : ""}`}
                  type="button"
                  onClick={() => {
                    setActiveTab("Participants");
                    setSelectedUserIds([]);
                  }}
                  style={
                    activeTab === "Participants"
                      ?  {
                        border: "2px solid #ff7102",
                          color: "white",
                          backgroundColor: "#ff7102",
                          borderRadius: 0,
                        }
                      : {color:"black"}
                  }
                >
                  Participants
                </button>
              </li>
            </ul>

            <div className="mb-2 px-2 d-flex gap-2" style={{ padding: 2 }}>
              <input
                type="text"
                className="form-control"
                style={{ border: "2px solid #ff7102",
                  color: "#ff7102",
                  backgroundColor: "transparent",
                  borderRadius: 10,}}
                placeholder="Search by name, username or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {activeTab !== "Participants" && (
                <button
                  type="button"
                  className="btn text-nowrap"
                  style={{ border: "2px solid #ff7102",
                    color: "#ff7102",
                    backgroundColor: "transparent",
                    borderRadius: 10,}}
                  onClick={handleSelectAll}
                >
                  {selectedUserIds.length === selectableUsers.length &&
                  selectableUsers.length > 0
                    ? "Unselect all"
                    : "Select all"}
                </button>
              )}
            </div>

            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
              {isLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-muted p-4">
                  No users found.
                </div>
              ) : activeTab !== "Participants" ? (
                <ul className="list-group">
                  {filteredUsers.map((user) => {
                    const id = getId(user);
                    const excluded = isUserExcluded(user);
                    const fullName = `${user.firstName || ""} ${
                      user.lastName || ""
                    }`.trim();
                    const checked = selectedUserIds.includes(id);
                    const avatar = user.profileImage
                      ? getImage(user.profileImage)
                      : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";
                    return (
                      <li
                        key={id}
                        className={`list-group-item d-flex align-items-center justify-content-between ${
                          excluded ? "list-group-item-secondary" : ""
                        }`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              disabled={excluded}
                              checked={checked}
                              onChange={() => toggleSelect(user)}
                            />
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={avatar}
                              alt={fullName || user.username || user.email}
                              width={40}
                              height={40}
                              style={{
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />

                            <div className="fw-semibold">
                              {fullName || user.username || user.email}
                              <div className="small text-muted">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          {excluded ? (
                            <span  className="badge" style={{
                              color: "white",
                              fontSize:12,
                              backgroundColor: "#ff7102",
                              borderRadius: 4,}}>
                              Invite sent
                            </span>
                          ) : (
                            <span className="text-muted small">
                              {user.username || ""}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3 px-4">
                    <h6 className="mb-0 fw-bold">
                      Slots Filled:
                      {participantsData ? participantsData.length : 0}
                    </h6>
                    <h6 className="mb-0 fw-bold">
                      Slots Left:
                      {noOfVehicles -
                        (participantsData ? participantsData.length : 0)}
                    </h6>
                  </div>
                  <ul className="list-group">
                    {filteredUsers.map((item) => {
                      const { user } = item;
                      const id = item.id;
                      const fullName = `${user.firstName || ""} ${
                        user.lastName || ""
                      }`.trim();
                      const avatar = user.profileImage
                        ? getImage(user.profileImage)
                        : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";
                      return (
                        <li
                          key={id}
                          className={`list-group-item  d-flex align-items-center justify-content-between`}
                        >
                          <div className="d-flex px-3 align-items-center gap-5">
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={avatar}
                                alt={fullName || user.username || user.email}
                                width={40}
                                height={40}
                                style={{
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <div>
                              <div className="fw-semibold">
                                {fullName || user.username || user.email}{" "}
                            
                              </div>
                              <div className="small text-muted">
                              {user.username && `${user.username}`}
                              </div>
                              </div>
                            </div>
                          </div>

                          <div className="pe-2">
                            <button
                              type="button"
                              className="btn btn-link text-dark p-0"
                              title="Remove participant"
                              onClick={() => {
                                handleDelete(id);
                              }}
                              disabled={isDeleteLoading && deletingUser === id}
                            >
                              {isDeleteLoading && deletingUser === id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                <span className="icon">
                                  <img
                                    alt="icon"
                                    src="/assets/images/dashboard/trash.svg"
                                    width={16}
                                    height={16}
                                    style={{
                                      filter: "brightness(0) saturate(100%)",
                                    }}
                                  />
                                </span>
                              )}{" "}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <div className="me-auto small text-muted align-self-center">
              {selectedUserIds.length > 0
                ? `${selectedUserIds.length} selected`
                : "No users selected"}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={sendingInvite}
            >
              Close
            </button>
            {activeTab !== "Participants" && (
              <button
                type="button"
                className="btn"
                style={{backgroundColor:"#ff7102",color:"white"}}
                onClick={handleSendInvites}
                disabled={selectedUserIds.length === 0 || sendingInvite}
              >
                {sendingInvite ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Sending...
                  </>
                ) : (
                  "Send invites"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
