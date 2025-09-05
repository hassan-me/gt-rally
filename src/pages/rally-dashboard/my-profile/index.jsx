import MyProfile from "@/components/rally-dashboard/MyProfile";
import Sidebar from "@/components/rally-dashboard/Sidebar";
import Header4 from "@/components/rally-headers/Header4";
import React from "react";

import MetaComponent from "@/components/common/MetaComponent";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/slices/api.slice";
import { errorToast, successToast } from "@/components/common/Toast";
const metadata = {
  title:
    "My Profile || AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
  description: "AutoDeal - Car Dealer, Rental & Listing Reactjs Template",
};




export default function MyProfilePage() {
  const {
    isLoading,
    data: profile,
    error: getProfileError,
    isError: isGetProfileError,
    refetch,
  } = useGetProfileQuery();

  const [updateProfile,{isLoading:updateProfileLoading}] = useUpdateProfileMutation();


  const onProfileUpdate = async (formData) => {
    try {
      const response = await updateProfile(formData).unwrap();
      refetch()

      successToast(response?.message || "Profile updated successfully!");
    } catch (err) {
      errorToast(
        err?.data?.message || "Profile update failed. Please try again.",
        "error"
      );
    }
  };

  return (
    <>
      <MetaComponent meta={metadata} />
      <Sidebar />
      <div id="wrapper-dashboard">
        <div id="pagee" className="clearfix">
          <Header4 />
        </div>
        <div id="themesflat-content"></div>
        <div className="dashboard-toggle">Show DashBoard</div>
        <MyProfile onComplete={onProfileUpdate} updateProfileLoading={updateProfileLoading}  profile={profile}/>
      </div>
    </>
  );
}
