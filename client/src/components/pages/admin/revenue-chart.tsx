import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface DataPoint {
  month: string;
  revenue: number;
  coursesAdded: number;
  coursesEnrolled: number;
}

interface Props {
  data: DataPoint[];
}

const RevenueChart: React.FC<Props> = ({ data }) => {
  const chartOptions: Partial<ApexOptions> = {
    chart: {
      id: 'revenue-chart',
      animations: {
        enabled: true,
        easing: 'linear',
        speed: 300,
      },
    },
    xaxis: {
      categories: data.map((d) => d?.month || 'Unknown'),
      labels: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Amount',
      },
    },
    stroke: {
      curve: 'smooth',
    },
  };

  const chartSeries = [
    {
      name: 'Monthly Revenue',
      data: data.map((d) => d?.revenue ?? 0),
    },
    {
      name: 'Courses Added',
      data: data.map((d) => d?.coursesAdded ?? 0),
    },
    {
      name: 'Courses Enrolled',
      data: data.map((d) => d?.coursesEnrolled ?? 0),
    },
  ];

  return (
    <div className="bg-white p-4 shadow rounded-md">
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={300}
      />
    </div>
  );
};

export default RevenueChart;
