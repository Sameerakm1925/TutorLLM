import React from "react";
import DashSideNav from "./dash-side-nav";
import DashHeader from "./dash-header";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectStudent } from "../../../redux/reducers/studentSlice";

type Props = {};

const UserDashboard: React.FC = (props: Props) => {
  const navigate = useNavigate();
  const { studentDetails } = useSelector(selectStudent);

  React.useEffect(() => {
    if (studentDetails && !studentDetails.isOnboardingComplete) {
      navigate("/onboarding");
    }
  }, [studentDetails, navigate]);

  return (
    <div className="fixed inset-x-0 top-0 flex flex-col font-sans">
      <DashHeader />

      {/* For small screens, hide the side nav */}
      <div className="block md:hidden">
        <div className="flex flex-col ">
          <div className="pb-32 h-screen overflow-y-auto scrollbar-thin">
            <Outlet />
          </div>
        </div>
      </div>

      {/* For medium and large screens, show the side nav */}
      <div className="hidden md:flex flex-1">
        <div className="w-64 h-screen overflow-y-auto scrollbar-thin">
          <DashSideNav />
        </div>
        <div className="flex flex-col flex-1">
          <div className="p-4 bg-customBlueShade overflow-y-scroll scrollbar-thin pb-32 h-screen">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
