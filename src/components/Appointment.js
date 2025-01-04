import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Appointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time_slot: "",
    reason: "",
    notes: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchPatientId = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/patients/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        const patientData = response.data.find((p) => p.user.id === user.id);
        if (patientData) setPatientId(patientData.id);
        else throw new Error("Không tìm thấy thông tin bệnh nhân.");
      } catch (error) {
        setErrorMessage(error.message || "Không thể tải thông tin bệnh nhân.");
      }
    };

    fetchPatientId();
  }, [user, navigate]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/doctors/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setDoctors(response.data);
      } catch {
        setErrorMessage("Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/appointments/available_slots/",
        {
          params: { doctor: doctorId, date },
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      setAvailableSlots(response.data.available_slots || []);
    } catch {
      setErrorMessage("Không thể tải thời gian khả dụng. Vui lòng thử lại.");
    }
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({ ...prev, doctor: doctorId, time_slot: "" }));
    if (formData.date) fetchAvailableSlots(doctorId, formData.date);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: selectedDate, time_slot: "" }));
    if (formData.doctor) fetchAvailableSlots(formData.doctor, selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!patientId) {
      setErrorMessage("Không thể lấy ID bệnh nhân. Vui lòng thử lại.");
      setIsSubmitting(false);
      return;
    }

    const requestData = {
      doctor: parseInt(formData.doctor, 10),
      patient: patientId,
      date: formData.date,
      time_slot: formData.time_slot,
      reason: formData.reason,
      notes: formData.notes || "",
      status: "pending",
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/appointments/", requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("Đặt lịch khám thành công!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      const errorData = error.response?.data;
      setErrorMessage(
        errorData?.message || errorData?.detail || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Card className="shadow-sm mt-4 mb-4 mx-5">
        <Card.Body>
          <h2 className="text-center mb-4">Đặt lịch khám bệnh</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          {loadingDoctors ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p>Đang tải danh sách bác sĩ...</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn bác sĩ</Form.Label>
                    <Form.Select value={formData.doctor} onChange={handleDoctorChange} required>
                      <option value="">-- Chọn bác sĩ --</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.user.last_name} {doctor.user.first_name} - {doctor.expertise}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* {selectedDoctor && (
                      <Card className="mb-3 bg-light">
                        <Card.Body>
                          <h6>Thông tin bác sĩ:</h6>
                          <p className="mb-1">Chuyên khoa: {selectedDoctor.expertise}</p>
                          <p className="mb-1">Khoa: {selectedDoctor.department_name}</p>
                        </Card.Body>
                      </Card>
                    )} */}
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày khám</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Chọn thời gian</Form.Label>
                <Form.Select
                  value={formData.time_slot}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time_slot: e.target.value }))
                  }
                  required
                  disabled={!availableSlots.length}
                >
                  <option value="">-- Chọn thời gian --</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Lý do khám</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  // rows={1}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }

                />
              </Form.Group>

              <p>Quý khách sử dụng dịch vụ Đặt lịch khám bệnh, xin vui lòng đặt trước ít nhất là 24 giờ trước khi đến khám. 
                Trong những trường hợp khẩn cấp hoặc nghi ngờ có các triệu chứng nguy hiểm, quý khách nên ĐẾN TRỰC TIẾP PHÒNG KHÁM hoặc đến Trung tâm Y tế gần nhất để kịp thời xử lý.
              </p>

              <div class="d-flex justify-content-center">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default Appointment;
