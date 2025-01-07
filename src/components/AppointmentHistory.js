import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert, Table } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import Header from "./Header";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [sortOrder, setSortOrder] = useState("desc");

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/appointments/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setAppointments(response.data);

      const doctorIds = response.data.map((appointment) => appointment.doctor);
      fetchDoctors(doctorIds);
    } catch (error) {
      setErrorMessage("Không thể tải lịch sử đặt lịch khám.");
      console.error("Lỗi API lịch hẹn", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async (doctorIds) => {
    try {
      const uniqueDoctorIds = [...new Set(doctorIds)];
      const response = await axios.get("http://127.0.0.1:8000/api/doctors/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setDoctors(response.data.filter(doctor => uniqueDoctorIds.includes(doctor.id)));
    } catch (error) {
      console.error("Lỗi API bác sĩ", error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchAppointments();

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  }, [user, navigate, location]);

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(doc => doc.id === doctorId);
    return doctor ? `${doctor.user.last_name} ${doctor.user.first_name}` : "Chưa có thông tin";
  };

  const getDoctorExpertise = (doctorId) => {
    const doctor = doctors.find(doc => doc.id === doctorId);
    return doctor ? `${doctor.expertise}` : "Chưa có thông tin";
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'examining':
        return 'Đang khám';
      case 'awaiting_clinical_results':
        return 'Đang thực hiện xét nghiệm cận lâm sàng';
      case 'paraclinical_results_available':
        return 'Đã có kết quả xét nghiệm cận lâm sàng';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleSort = () => {
    const sortedAppointments = [...appointments].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    setAppointments(sortedAppointments);
    setSortOrder(sortOrder === "desc" ? "asc" : "desc"); 
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt-5">
        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="danger" className="mb-4">
            {errorMessage}
          </Alert>
        )}

        <h2 className="text-center mb-4">Lịch sử đặt lịch khám</h2>

        {appointments.length === 0 ? (
          <Alert variant="info">Bạn chưa có lịch khám nào.</Alert>
        ) : (
          <Table striped bordered hover responsive className="text-center">
            <thead>
              <tr>
                <th>Bác sĩ</th>
                <th>
                  Ngày{" "}
                  <i
                    className={`bi ${sortOrder === "desc" ? "bi-sort-up" : "bi-sort-down"}`}
                    style={{ cursor: "pointer" }}
                    onClick={handleSort}
                  ></i>
                </th>
                <th>Thời gian</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{getDoctorName(appointment.doctor)} - {getDoctorExpertise(appointment.doctor)}</td>
                  <td>
                    {appointment.date ? new Date(appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                  </td>
                  <td>
                    {appointment.time_slot}
                  </td>
                  <td>{appointment.reason}</td>
                  <td>
                    <span
                      className={`badge ${
                        appointment.status === "confirmed"
                          ? "bg-primary"
                          : appointment.status === "examining"
                          ? "bg-warning"
                          : appointment.status === "awaiting_clinical_results"
                          ? "bg-warning"
                          : appointment.status === "paraclinical_results_available"
                          ? "bg-success"
                          : appointment.status === "completed"
                          ? "bg-success"
                          : appointment.status === "cancelled"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td>{appointment.notes || "Không có"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default AppointmentHistory;

