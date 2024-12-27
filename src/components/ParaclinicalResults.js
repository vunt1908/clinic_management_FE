import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Spinner,
  Alert,
  Container,
  Dropdown,
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import { useAuth } from './AuthContext';
import Header from './Header';

const ParaclinicalResults = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [services, setServices] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [examinationData, setExaminationData] = useState({
    pathological_process: "",
    personal_history: "",
    family_history: "",
    symptoms: "",
    diagnosis: "",
    paraclinical_results: null,
    results: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/appointments/?doctor=${user.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      setAppointments(response.data);

      const servicesResponse = await axios.get(
        `http://127.0.0.1:8000/api/services/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      setServices(servicesResponse.data);

      const uniquePatientIds = [...new Set(response.data.map((a) => a.patient))];
      const patientDetails = {};
      await Promise.all(
        uniquePatientIds.map(async (id) => {
          const patientResponse = await axios.get(
            `http://127.0.0.1:8000/api/patients/${id}/`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
          patientDetails[id] = patientResponse.data;
        })
      );
      setPatients(patientDetails);
    } catch (err) {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenModal = async (appointment, type) => {
    setSelectedAppointment(appointment);
    setModalType(type);
    setModalVisible(true);
  
    if (appointment.id) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/examination/?appointment=${appointment.id}`, 
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        if (response.data && response.data.length > 0) {
          const examination = response.data[0]; 
          setExaminationData(examination);
          setSelectedServices(examination.services || []);
        } else {
          setExaminationData({}); 
        }
      } catch (err) {
        console.error("Không thể tải thông tin examination:", err);
        setExaminationData({});
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setExaminationData({
      pathological_process: "",
      personal_history: "",
      family_history: "",
      symptoms: "",
      diagnosis: "",
      paraclinical_results: null,
      results: "",
    });
    setSelectedServices([]);
    setModalType(null);
    setSelectedAppointment(null);
  };

  const handleFileChange = (e) => {
    setExaminationData({
      ...examinationData,
      paraclinical_results: e.target.files[0],
    });
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdating(true);
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/appointments/${appointmentId}/update_status/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
      setError(null); 
    } catch (error) {
      setError("Không thể cập nhật trạng thái lịch hẹn.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveExamination = async () => {
    try {
      const formData = new FormData();
      if (examinationData?.paraclinical_results instanceof File) {
        console.log("Thêm file vào formData:", examinationData.paraclinical_results);
        formData.append("paraclinical_results", examinationData.paraclinical_results);
      } else {
          console.log("Không có file hợp lệ.");
      }

      if (selectedAppointment.examination) { 
        await axios.patch(
          `http://127.0.0.1:8000/api/examination/${selectedAppointment.examination.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/examination/?appointment=${selectedAppointment.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );

        if (response.data.length != 0) {
          await axios.patch(
            `http://127.0.0.1:8000/api/examination/${response.data[0].id}/`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }
  
        alert("Cập nhật thành công");
        handleCloseModal();
        fetchData();
    } catch (err) {
      console.error(err);
      alert("Không thể lưu thông tin khám bệnh.");
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)  
        : [...prev, serviceId]  
    );
  };

  const handleSaveServices = async () => {
    try {
      const payload = {
        services: selectedServices,
      };

      if (selectedAppointment.examination) {
        await axios.patch(
          `http://127.0.0.1:8000/api/examination/${selectedAppointment.examination.id}`, 
          payload, 
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
            }
          }
        );
  
        alert("Dịch vụ đã được cập nhật.");
        handleCloseModal();  
      } else {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/examination/?appointment=${selectedAppointment.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        if (response.data.length >= 0) {
          await axios.patch(
            `http://127.0.0.1:8000/api/examination/${response.data[0].id}/`,
            payload,
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
        }
  
        alert("Dịch vụ đã được cập nhật.");
        handleCloseModal(); 
      }
    } catch (err) {
      console.error("Không thể lưu dịch vụ:", err);
      alert("Không thể lưu dịch vụ.");
    }
  };
  

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Header />
      <Container className="mt-5">
        <h2 className="text-center mb-4">Danh sách khám bệnh</h2>
        {appointments.length === 0 ? (
          <Alert variant="info">Không có lịch đặt khám nào.</Alert>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr className="text-center">
                <th>STT</th>
                <th>ID bệnh nhân</th>
                <th>Tên bệnh nhân</th>
                <th>Ngày</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {appointments.map((appointment, index) => {
                const patient = patients[appointment.patient];
                return (
                  <tr key={appointment.id}>
                    <td>{index + 1}</td>
                    <td>{patient ? patient.id : "Đang tải"}</td>
                    <td>
                      {patient
                        ? `${patient.user.last_name} ${patient.user.first_name}`
                        : "Đang tải..."}
                    </td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time_slot}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="secondary">
                          {appointment.status === "pending"
                            ? "Chờ xác nhận"
                            : appointment.status === "confirmed"
                            ? "Đã xác nhận"
                            : appointment.status === "examining"
                            ? "Đang khám"
                            : appointment.status === "awaiting_clinical_results"
                            ? "Đang thực hiện xét nghiệm cận lâm sàng"
                            : appointment.status === "paraclinical_results_available"
                            ? "Đã có kết quả xét nghiệm cận lâm sàng"
                            : appointment.status === "completed"
                            ? "Hoàn tất"
                            : "Đã hủy"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(appointment.id, "confirmed")
                                }
                              >
                                Xác nhận
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(appointment.id, "examining")
                                }
                              >
                                Đang khám
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(appointment.id, "awaiting_clinical_results")
                                }
                              >
                                Đang thực hiện xét nghiệm cận lâm sàng
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(appointment.id, "paraclinical_results_available")
                                }
                              >
                                Đã có kết quả xét nghiệm cận lâm sàng
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(appointment.id, "completed")
                                }
                              >
                                Đã hoàn thành
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(appointment.id, "cancelled")
                                }
                              >
                                Hủy
                              </Dropdown.Item>
                            </>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="me-2"
                        onClick={() => handleOpenModal(appointment, "edit")}
                      >
                        Thêm mới
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => handleOpenModal(appointment, "assignment")}
                      >
                        Dịch vụ chỉ định
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Container>

      {modalVisible && (
        <Modal show={modalVisible} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "edit" && "Thêm mới kết quả cận lâm sàng"}
              {modalType === "assignment" && "Chỉ định dịch vụ"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalType === "edit" && (
              <Form>
                <Form.Group>
                <Form.Label>Kết quả cận lâm sàng</Form.Label>
                {examinationData.paraclinical_results && (
                  <p>
                    <a
                      href={examinationData.paraclinical_results}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem kết quả
                    </a>
                  </p>
                )}
                <Form.Control 
                  type="file" 
                  onChange={(e) => {
                      setExaminationData((prevData) => ({
                          ...prevData,
                          paraclinical_results: e.target.files[0],
                      }));
                  }} 
                />
              </Form.Group>
              </Form>
            )}

            {modalType === "assignment" && (
              <Form>
                <Form.Group>
                  <Form.Label>Chỉ định dịch vụ</Form.Label>
                  {services.map((service) => (
                    <Form.Check
                      key={service.id}
                      type="checkbox"
                      label={`${service.name} - ${service.price ? `${service.price.toLocaleString()} VND` : 'Liên hệ'}`}
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                    />
                  ))}
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            {modalType === "edit" && (
              <Button variant="primary" onClick={handleSaveExamination}>
                Lưu
              </Button>
            )}
            {modalType === "assignment" && (
              <Button variant="primary" onClick={handleSaveServices}>
                Lưu
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseModal}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default ParaclinicalResults;
