import React, { useState, useEffect } from "react";
import RevenueChart from "./revenue-chart";
import TrendingCoursesChart from "./trending-chart";
import CourseCategoryChart from "./progress-chart";
import { Typography } from "@material-tailwind/react";
import { FaRupeeSign } from "react-icons/fa";
import {
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";
import {
  getDashboardData,
  getGraphData,
} from "../../../api/endpoints/dashboard-data";
import {
  DashData,
  GraphData,
} from "../../../api/types/apiResponses/api-response-dash";
import { formatToINR } from "../../../utils/helpers";
import { toast } from "react-toastify";
import { Card } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, seDashboardData] = useState<DashData | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const fetchDashboardDetails = async () => {
    try {
      const response = await getDashboardData();
      seDashboardData(response.data);
    } catch (error) {
      toast.error("Something went wrong")
    }
  };

  const fetchGraphData = async () => {
    try {
      const response = await getGraphData();
      setGraphData(response.data);
    } catch (error) {
      toast.error("Something went wrong")
    }
  };
  useEffect(() => {
    fetchDashboardDetails();
    fetchGraphData();
  }, []);

  return (
    <div className=' pl-1'>
      <div className='ml-3 mr-3 flex items-center justify-between'>
        <div className='bg-white flex-1 rounded-md pb-5 pr-5 pl-5 border shadow-sm border-gray-200 mr-4'>
          <div className='flex items-center '>
            <FaRupeeSign size={26} className='text-green-500 mr-3' />
            <div>
              <Typography variant='h6' color='blue-gray' className='pt-2 '>
                Monthly revenue
              </Typography>
              <Typography variant='body' color='gray'>
                {formatToINR(dashboardData?.monthlyRevenue ?? 0)}
              </Typography>
            </div>
          </div>
        </div>
        <div className='bg-white flex-1 rounded-md pb-5 pr-5 pl-5 shadow-sm border border-gray-200 mr-4'>
          <div className='flex items-center'>
            <AiOutlineBook size={26} className='text-blue-500 mr-3' />
            <div>
              <Typography variant='h6' color='blue-gray' className='pt-2 '>
                Courses
              </Typography>
              <Typography variant='body' color='gray'>
                {dashboardData?.numberOfCourses}
              </Typography>
            </div>
          </div>
        </div>
        <div className='bg-white flex-1 rounded-md pb-5 shadow-sm pr-5 pl-5 border border-gray-200 mr-4'>
          <div className='flex items-center'>
            <AiOutlineUser size={26} className='text-yellow-500 mr-3' />
            <div>
              <Typography variant='h6' color='blue-gray' className='pt-2 '>
                Instructors
              </Typography>
              <Typography variant='body' color='gray'>
                {dashboardData?.numberInstructors}
              </Typography>
            </div>
          </div>
        </div>
        <div className='bg-white flex-1 rounded-md pb-5 shadow-sm pr-5 pl-5 border border-gray-200'>
          <div className='flex items-center'>
            <AiOutlineUsergroupAdd size={26} className='text-red-500 mr-3' />
            <div>
              <Typography variant='h6' color='blue-gray' className='pt-2 '>
                Students
              </Typography>
              <Typography variant='body' color='gray'>
                {dashboardData?.numberOfStudents}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <div className='py-5 px-4'>
        <Typography variant='h3' color='blue-gray' className='mb-4'>
          Monthly Revenue Chart
        </Typography>
        <RevenueChart data={graphData?.revenue ?? []} />
      </div>
      <div className='flex items-center '>
        <div className='py-5 px-4 w-6/12'>
          <Typography variant='h4' color='blue-gray' className='mb-4'>
            Trending Courses
          </Typography>
          <TrendingCoursesChart data={graphData?.trendingCourses??[]} />
        </div>
        <div className='px-4 w-6/12'>
          <Typography variant='h4' color='blue-gray' className='mb-4'>
            Categories
          </Typography>
          <CourseCategoryChart data={graphData?.courseByCategory??[]} />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-8'>
        <Card className="p-6 shadow-sm border border-gray-200">
          <Typography variant="h5" color="blue-gray" className="mb-4 font-bold">
            Quick Actions
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate("/admin/categories/add-category")}
              className="p-3 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-center"
            >
              Add New Category
            </button>
            <button 
              onClick={() => navigate("/admin/instructors/requests")}
              className="p-3 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-center"
            >
              Review Requests
            </button>
            <button 
              onClick={() => navigate("/admin/courses")}
              className="p-3 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-center"
            >
              Manage Courses
            </button>
            <button 
              onClick={() => navigate("/admin/settings")}
              className="p-3 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-center"
            >
              Portal Settings
            </button>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border border-gray-200">
          <Typography variant="h5" color="blue-gray" className="mb-4 font-bold">
            System Health
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Connection</span>
              <span className="flex items-center text-green-600 text-sm font-bold">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage Service (AWS S3)</span>
              <span className="flex items-center text-green-600 text-sm font-bold">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Video Streaming (CDN)</span>
              <span className="flex items-center text-green-600 text-sm font-bold">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Authentication Service</span>
              <span className="flex items-center text-green-600 text-sm font-bold">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminHomePage;
