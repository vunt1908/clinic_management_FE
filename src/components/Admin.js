import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FaBars, FaCog, FaTimes, FaUserMd, FaHospital } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import logo from "../assets/logo.png"; 
import adminAvatar from "../assets/admin-avatar.png"; 
import { useAuth } from "./AuthContext";
import Dropdown from "react-bootstrap/Dropdown";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="d-flex">
      <div
        className={`bg-white border-end shadow-sm ${
          isSidebarOpen ? "col-3 col-md-2" : ""
        } d-flex flex-column vh-100 p-0`}
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          {isSidebarOpen && <img src={logo} alt="Clinic" height="40" />}
          <button className="btn btn-light p-1" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        {isSidebarOpen && (
          <div className="text-center py-3 border-bottom">
            <img
              src={adminAvatar}
              alt="Admin"
              className="rounded-circle mb-2"
              style={{ width: "80px", height: "80px" }}
            />
            <h5 className="mb-0">{user.username}</h5>
            <small className="text-muted">{user.role}</small>
          </div>
        )}
        <nav className="flex-grow-1">
          <Link to="/admin/dashboard" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <MdDashboard className="me-2" />
            {isSidebarOpen && "Dashboard"}
          </Link>
          <Link to="/admin/manage-doctors" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaUserMd className="me-2" />
            {isSidebarOpen && "Quản lý bác sỹ"}
          </Link>

          <Link to="/admin/manage-patients" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaUserMd className="me-2" />
            {isSidebarOpen && "Quản lý bệnh nhân"}
          </Link>

          <Link to="/admin/manage-staffs" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaUserMd className="me-2" />
            {isSidebarOpen && "Quản lý nhân viên"}
          </Link>

          <Link to="/admin/manage-nurses" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaUserMd className="me-2" />
            {isSidebarOpen && "Quản lý y tá"}
          </Link>

          <Link to="/admin/manage-appointments" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaUserMd className="me-2" />
            {isSidebarOpen && "Quản lý đặt lịch"}
          </Link>

          <Link to="/admin/manage-services" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaHospital className="me-2" />
            {isSidebarOpen && "Quản lý dịch vụ cận lâm sàng"}
          </Link>
          
          <Link to="/admin/manage-departments" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaHospital className="me-2" />
            {isSidebarOpen && "Quản lý khoa"}
          </Link>

          <Link to="/admin/manage-examinations" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaHospital className="me-2" />
            {isSidebarOpen && "Quản lý thông tin khám bệnh"}
          </Link>

          <Link to="/admin/manage-payments" className="d-flex align-items-center p-3 text-decoration-none text-dark">
            <FaHospital className="me-2" />
            {isSidebarOpen && "Quản lý thanh toán"}
          </Link>
        </nav>
      </div>

      <div className="flex-grow-1 d-flex flex-column" style={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
        <div className="bg-white border-bottom d-flex align-items-center justify-content-end py-2 px-4 shadow-sm">
        <Dropdown>
            <Dropdown.Toggle
              variant="light"
              id="dropdown-basic"
              className="border-0 bg-transparent"
              style={{ boxShadow: "none" }}
            >
              <img
                src={adminAvatar}
                alt="Admin"
                className="rounded-circle"
                style={{ width: "40px", height: "40px" }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => navigate("/profile")}>
                Xem Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="flex-grow-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
