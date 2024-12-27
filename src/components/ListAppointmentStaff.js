import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Alert, Spinner, Button, Card } from "react-bootstrap";
import Header from './Header';

const ListAppointmentStaff = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const appointmentResponse = await axios.get(
          "http://127.0.0.1:8000/api/appointments/staff_list/",
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );

        const patientResponse = await axios.get(
          "http://127.0.0.1:8000/api/patients/",
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );

        const doctorResponse = await axios.get(
          "http://127.0.0.1:8000/api/doctors/",
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );

        setAppointments(appointmentResponse.data);
        setPatients(patientResponse.data);
        setDoctors(doctorResponse.data);
      } catch (error) {
        setErrorMessage("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.user.last_name} ${patient.user.first_name}` : "Không xác định";
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? `${doctor.user.last_name} ${doctor.user.first_name}` : "Không xác định";
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'examining':
        return 'Đang khám';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <Card className="shadow-sm mt-5 mx-5">
        <Card.Body>
          <h2 className="text-center mb-4">Danh sách đặt lịch khám</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th className="text-center">Họ và tên người bệnh</th>
                  <th className="text-center">Bác sĩ</th>
                  <th className="text-center">Ngày</th>
                  <th className="text-center">Thời gian</th>
                  <th className="text-center">Lý do</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment, index) => (
                    <tr key={appointment.id}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">{getPatientName(appointment.patient)}</td>
                      <td className="text-center">{getDoctorName(appointment.doctor)}</td>
                      <td className="text-center">
                        {appointment.date ? new Date(appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                      </td>
                      <td className="text-center">{appointment.time_slot}</td>
                      <td>{appointment.reason}</td>
                      <td className="text-center"><span
                      className={`badge ${
                        appointment.status === "confirmed"
                          ? "bg-success"
                          : appointment.status === "completed"
                          ? "bg-primary"
                          : appointment.status === "examining"
                          ? "bg-warning"
                          : appointment.status === "cancelled"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {getStatusText(appointment.status)}
                    </span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Không có lịch hẹn nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default ListAppointmentStaff;

