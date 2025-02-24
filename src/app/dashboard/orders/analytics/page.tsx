"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OrderStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
}

interface OrderTrend {
  date: string;
  count: number;
}

export default function OrderAnalyticsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [trends, setTrends] = useState<OrderTrend[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/orders/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        console.log("Analytics data received:", data);
        
        setStats(data.stats);
        setTrends(data.trends);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(error instanceof Error ? error.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // Calculate the maximum count for the trend chart
  const maxCount = Math.max(...trends.map(t => t.count), 1);
  console.log("Trends data:", trends);
  console.log("Max count:", maxCount);

  const data = {
    labels: trends.map(trend => new Date(trend.date).toLocaleDateString()),
    datasets: [{
      label: 'Orders',
      data: trends.map(trend => trend.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Order Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const exportToCSV = () => {
    const csvData = [
      ['Date', 'Count'],
      ...trends.map(trend => [new Date(trend.date).toLocaleDateString(), trend.count]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'order_trends.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <button onClick={exportToCSV} className="mt-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
        Export to CSV
      </button>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Order Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of order statistics and trends
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total || 0}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.pending || 0}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.approved || 0}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.completed || 0}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.cancelled || 0}</dd>
        </div>
      </dl>

      {/* Trends Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Trends (Last 7 Days)</h3>
        <div className="h-96">
          {trends.length > 0 ? (
            <div className="relative h-full">
              <Bar data={data} options={options} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">Debug Information</h4>
          <pre className="mt-2 text-xs text-gray-600 overflow-auto">
            {JSON.stringify({ trends, stats }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 