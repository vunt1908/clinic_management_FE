import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

const Dashboard = () => {
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Thống kê hệ thống</h1>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Tổng số bệnh nhân</h5>
              <p className="card-text fs-3">{statistics.total_patients}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Tổng số bác sĩ</h5>
              <p className="card-text fs-3">{statistics.total_doctors}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Tổng số dịch vụ</h5>
              <p className="card-text fs-3">{statistics.total_services}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Dịch vụ được chọn nhiều nhất</h5>
              <p className="card-text fs-3">
                {statistics.most_selected_service ? statistics.most_selected_service.name : "Chưa có dịch vụ nào"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Lịch hẹn hôm nay</h5>
              <p className="card-text fs-3">{statistics.today_appointments}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Thanh toán đang chờ</h5>
              <p className="card-text fs-3">{statistics.pending_payments}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Thanh toán hoàn thành</h5>
              <p className="card-text fs-3">{statistics.completed_payments}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Tổng số tiền hoá đơn</h5>
              <p className="card-text fs-3">{statistics.total_payments} VNĐ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;