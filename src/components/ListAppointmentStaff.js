import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Alert, Spinner, Button, Card, Modal, Form, Container, } from "react-bootstrap";
import Header from './Header';

const ListAppointmentStaff = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        setErrorMessage("Không thể tải dữ liệu từ API. Vui lòng thử lại.");
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

  const handleShowPatient = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleShowDoctor = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setShowDoctorModal(true);
    }
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
        return 'Đang thực hiện xét nghiệm';
      case 'paraclinical_results_available':
        return 'Đã có kết quả xét nghiệm';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const removeVietnamese = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const handleSearch = (e) => {
    const value = removeVietnamese(e.target.value.toLowerCase());
    setSearchTerm(value);

    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const patientName = row.querySelector(".patient-name")?.innerText.toLowerCase() || "";
      const doctorName = row.querySelector(".doctor-name")?.innerText.toLowerCase() || "";

      const normalizedPatientName = removeVietnamese(patientName);
      const normalizedDoctorName = removeVietnamese(doctorName);

      if (normalizedPatientName.includes(value) || normalizedDoctorName.includes(value)) {
        row.classList.remove("d-none"); 
      } else {
        row.classList.add("d-none"); 
      }
    });
  };

  return (
    <>
      <Header />
      <Container className="mt-4">
        <h2 className="text-center mb-4">Danh sách đặt lịch khám</h2>
        <Form className="mb-4">
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân/bác sĩ..."
            value={searchTerm}
            onChange={handleSearch}
          />
        
        </Form>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <Table className="table-striped table-hover table-bordered shadow-sm rounded text-center">
            <thead>
              <tr className="text-center">
                <th>STT</th>
                <th>Họ và tên người bệnh</th>
                <th>Bác sĩ</th>
                <th>Ngày</th>
                <th>Thời gian</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment, index) => (
                  <tr key={appointment.id}>
                    <td className="text-center">{index + 1}</td>
                    <td
                      className="text-center text-primary patient-name"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleShowPatient(appointment.patient)}
                    >
                      {getPatientName(appointment.patient)}
                    </td>
                    <td className="text-center text-primary doctor-name"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleShowDoctor(appointment.doctor)}
                    >
                      {getDoctorName(appointment.doctor)}
                  </td>
                    <td className="text-center">
                      {appointment.date ? new Date(appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                    </td>
                    <td className="text-center">{appointment.time_slot}</td>
                    <td className="text-left">{appointment.reason}</td>
                    <td className="text-center"><span
                      className={`badge ${
                        appointment.status === "confirmed"
                          ? "bg-success"
                          : appointment.status === "completed"
                          ? "bg-success"
                          : appointment.status === "examining"
                          ? "bg-secondary"
                          : appointment.status === "awaiting_clinical_results"
                          ? "bg-info"
                          : appointment.status === "paraclinical_results_available"
                          ? "bg-primary"
                          : appointment.status === "cancelled"
                          ? "bg-danger"
                          : "bg-warning"
                        }`}
                        >
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <div className="progress mt-2" style={{ height: "8px", width: "100px" }}>
                        <div
                          className={`progress-bar ${
                            appointment.status === "pending"
                              ? "bg-warning"
                              : appointment.status === "confirmed"
                              ? "bg-success"
                              : appointment.status === "examining"
                              ? "bg-secondary"
                              : appointment.status === "awaiting_clinical_results"
                              ? "bg-info"
                              : appointment.status === "paraclinical_results_available"
                              ? "bg-primary"
                              : appointment.status === "completed"
                              ? "bg-success"
                              : appointment.status === "cancelled"
                              ? "bg-danger"
                              : "bg-dark"
                          }`}
                          role="progressbar"
                          style={{
                            width: `${
                              appointment.status === "pending"
                                ? "10%"
                                : appointment.status === "confirmed"
                                ? "30%"
                                : appointment.status === "examining"
                                ? "50%"
                                : appointment.status === "awaiting_clinical_results"
                                ? "70%"
                                : appointment.status === "paraclinical_results_available"
                                ? "85%"
                                : appointment.status === "completed"
                                ? "100%"
                                : appointment.status === "cancelled"
                                ? "0%"
                                : "0%"
                            }`,
                          }}
                          aria-valuenow={
                            appointment.status === "pending"
                              ? 10
                              : appointment.status === "confirmed"
                              ? 30
                              : appointment.status === "examining"
                              ? 50
                              : appointment.status === "awaiting_clinical_results"
                              ? 70
                              : appointment.status === "paraclinical_results_available"
                              ? 85
                              : appointment.status === "completed"
                              ? 100
                              : appointment.status === "cancelled"
                              ? 0
                              : 0
                          }
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </td>
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
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin bệnh nhân</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <>
              <p><strong>Họ và tên:</strong> {`${selectedPatient.user.last_name} ${selectedPatient.user.first_name}`}</p>
              <p><strong>Email:</strong> {selectedPatient.user.email}</p>
              <p><strong>Giới tính:</strong> {selectedPatient.user.gender === "male"
                ? "Nam"
                : selectedPatient.user.gender === "female"
                ? "Nữ"
                : "Khác"}
              </p>
              <p><strong>Số điện thoại:</strong> {selectedPatient.user.phone}</p>
              <p><strong>Ngày sinh:</strong> {new Date(selectedPatient.user.dob).toLocaleDateString("en-GB")}</p>
              <p><strong>Địa chỉ:</strong> {selectedPatient.user.address}</p>
              <p><strong>Nghề nghiệp:</strong> {selectedPatient.job}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDoctorModal} onHide={() => setShowDoctorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin bác sĩ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <>
              <p>
                <strong>Họ và tên:</strong>{" "}
                {`${selectedDoctor.user.last_name} ${selectedDoctor.user.first_name}`}
              </p>
              <p>
                <strong>Email:</strong> {selectedDoctor.user.email}
              </p>
              <p>
                <strong>Giới tính:</strong>{" "}
                {selectedDoctor.user.gender === "male"
                  ? "Nam"
                  : selectedDoctor.user.gender === "female"
                  ? "Nữ"
                  : "Khác"}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {selectedDoctor.user.phone}
              </p>
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {new Date(selectedDoctor.user.dob).toLocaleDateString("en-GB")}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {selectedDoctor.user.address}
              </p>
              <p>
                <strong>Chuyên môn:</strong> {selectedDoctor.expertise}
              </p>
              <p>
                <strong>Khoa:</strong> {selectedDoctor.department_name}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ListAppointmentStaff;

