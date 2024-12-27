import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Alert, Card, Spinner } from "react-bootstrap";
import Header from './Header';

const StaffAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctor: "",
    patient: "",
    date: "",
    time_slot: "",
    reason: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const doctorResponse = await axios.get("http://127.0.0.1:8000/api/doctors/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        const patientResponse = await axios.get("http://127.0.0.1:8000/api/patients/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setDoctors(doctorResponse.data);
        setPatients(patientResponse.data);
      } catch (error) {
        setErrorMessage("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/appointments/available_slots/", {
        params: { doctor: doctorId, date },
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
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
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, date, time_slot: "" }));
    if (formData.doctor) fetchAvailableSlots(formData.doctor, date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await axios.post("http://127.0.0.1:8000/api/appointments/staff_create/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("Đặt lịch khám thành công!");
      setTimeout(() => navigate("/appointments/staff"), 1500);
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
      <Card className="shadow-sm mt-5 mx-5">
        <Card.Body>
          <h2 className="text-center mb-4">Tiếp nhận bệnh nhân</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
              <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn bệnh nhân</Form.Label>
                    <Form.Select
                      value={formData.patient}
                      onChange={(e) => setFormData((prev) => ({ ...prev, patient: e.target.value }))}
                      required
                    >
                      <option value="">-- Chọn bệnh nhân --</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.id} - {patient.user.last_name} {patient.user.first_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
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
                </Col>
              </Row>

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
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  // required
                />
              </Form.Group>

              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận tiếp nhận"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default StaffAppointment;
