import React, { useState, useEffect } from "react";
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.min.css';
import CanvasJSReact from './canvasjs.react.js';
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Dashboard = () => {
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState("week");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/dashboard/statistics/")
      .then((response) => {
        setStatistics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi API", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchChartData(chartFilter);
  }, [chartFilter]);

  const fetchChartData = (filter) => {
    let url = `http://127.0.0.1:8000/api/dashboard/statistics/?filter=${filter}`;
    axios
      .get(url)
      .then((response) => {
        const data = response.data.chart_data || [];
        setChartData(data.map(item => ({
          label: item.label,
          y: item.value
        })));
      })
      .catch((error) => {
        console.error("Lỗi API biểu đồ", error);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const chartOptions = {
    animationEnabled: true,
    data: [
      {
        type: "column",
        dataPoints: chartData,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <div className="row g-3">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container rounded-circle p-3">
                <i className="fas fa-user fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Bệnh nhân</h6>
                <h4 className="text-center">{statistics.total_patients}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container rounded-circle p-3">
                <i className="fas fa-user-md fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title mb-1">Bác sĩ</h6>
                <h4 className="mb-0">{statistics.total_doctors}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container bg-green rounded-circle p-3">
                <i className="fas fa-user-nurse fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Y tá</h6>
                <h4 className="text-center">{statistics.total_nurses}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container bg-orange rounded-circle p-3">
                <i className="fas fa-users fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Nhân viên</h6>
                <h4 className="text-center">{statistics.total_staffs}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container bg-purple rounded-circle p-3">
                <i className="fas fa-concierge-bell fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Dịch vụ</h6>
                <h4 className="text-center">{statistics.total_services}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container bg-teal rounded-circle p-3">
                <i className="fas fa-calendar-check fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Lịch hẹn</h6>
                <h4>{statistics.total_appointments}</h4>
                <div className="d-flex justify-content-between mt-2">
                  <span className="text-success m-2">Hoàn thành: {statistics.completed_appointments}</span>
                  <span className="text-warning m-2">Sắp tới: {statistics.upcoming_appointments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container bg-blue rounded-circle p-3">
                <i className="fas fa-money-bill-wave fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Doanh thu</h6>
                <h4>{statistics.total_payments} VNĐ</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-container bg-orange rounded-circle p-3">
                <i className="fas fa-star fa-2x"></i>
              </div>
              <div className="ms-3">
                <h6 className="card-title">Dịch vụ phổ biến</h6>
                <h4>{statistics.most_selected_service ? statistics.most_selected_service.name : "Chưa có"}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Doanh thu</h4>
          <select
            className="form-select w-auto"
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
          >
            <option value="week">Theo ngày</option>
            <option value="month">Theo tháng</option>
          </select>
        </div>
        <CanvasJSChart options={chartOptions} />
      </div>
  </div>
  );
};

export default Dashboard;