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
import { useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';
import Header from './Header';
import Swal from 'sweetalert2'

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
  const navigate = useNavigate();

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
    if (!user) {
      navigate("/login");
      return;
    }

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

  // const handleFileChange = (e) => {
  //   setExaminationData({
  //     ...examinationData,
  //     paraclinical_results: e.target.files[0],
  //   });
  // };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdating(true);
    try {
      await axios.patch(
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
        formData.append("paraclinical_results", examinationData.paraclinical_results);
      } else {
          console.log("File không hợp lệ.");
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

        if (response.data.length !== 0) {
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

  const handleDeleteParaclinicalResult = async () => {
    try {
      const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa kết quả xét nghiệm này?");
      if (!confirmDelete) return;
  
      if (selectedAppointment.examination) {
        await axios.patch(
          `http://127.0.0.1:8000/api/examination/${selectedAppointment.examination.id}/`,
          { paraclinical_results: null },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
      } else {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/examination/?appointment=${selectedAppointment.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
  
        if (response.data.length !== 0) {
          await axios.patch(
            `http://127.0.0.1:8000/api/examination/${response.data[0].id}/`,
            { paraclinical_results: null },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
        } else {
          alert("Không thể xóa kết quả xét nghiệm.");
          return;
        }
      }
  
      alert("Xóa kết quả xét nghiệm thành công.");
      setExaminationData((prevData) => ({
        ...prevData,
        paraclinical_results: null,
      }));
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Không thể xóa kết quả xét nghiệm.");
    }
  };

  // const handleServiceToggle = (serviceId) => {
  //   setSelectedServices((prev) =>
  //     prev.includes(serviceId)
  //       ? prev.filter((id) => id !== serviceId)  
  //       : [...prev, serviceId]  
  //   );
  // };

  // const handleSaveServices = async () => {
  //   try {
  //     const payload = {
  //       services: selectedServices,
  //     };

  //     if (selectedAppointment.examination) {
  //       await axios.patch(
  //         `http://127.0.0.1:8000/api/examination/${selectedAppointment.examination.id}`, 
  //         payload, 
  //         {
  //           headers: { 
  //             Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
  //           }
  //         }
  //       );
  
  //       alert("Dịch vụ đã được cập nhật.");
  //       handleCloseModal();  
  //     } else {
  //       const response = await axios.get(
  //         `http://127.0.0.1:8000/api/examination/?appointment=${selectedAppointment.id}`,
  //         { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
  //       );
  //       if (response.data.length >= 0) {
  //         await axios.patch(
  //           `http://127.0.0.1:8000/api/examination/${response.data[0].id}/`,
  //           payload,
  //           { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
  //         );
  //       }
  
  //       alert("Dịch vụ đã được cập nhật.");
  //       handleCloseModal(); 
  //     }
  //   } catch (err) {
  //     alert("Không thể lưu dịch vụ.");
  //   }
  // };

  const handleStatusConfirmation = (appointmentId, newStatus) => {
    Swal.fire({
      title: 'Xác nhận thay đổi trạng thái',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusChange(appointmentId, newStatus);
        Swal.fire('Thành công!', 'Trạng thái đã được thay đổi.', 'success');
      }
    });
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
          <Table className="table-striped table-hover table-bordered shadow-sm rounded align-middle">
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
              {appointments.filter((appointment) => appointment.status === "awaiting_clinical_results" || appointment.status === "paraclinical_results_available").map((appointment, index) => {
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
                    <td>
                      {appointment.date ? new Date(appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                    </td>
                    <td>{appointment.time_slot}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="info"
                          className={`${
                            appointment.status === "awaiting_clinical_results"
                              ? "bg-info text-white"
                              : appointment.status === "paraclinical_results_available"
                              ? "bg-success text-white"
                              : "bg-danger text-white"
                          }`}
                        >
                          {appointment.status === "awaiting_clinical_results"
                            ? "Đang thực hiện xét nghiệm"
                            : appointment.status === "paraclinical_results_available"
                            ? "Đã có kết quả xét nghiệm"
                            : "Đã hủy"}
                        </Dropdown.Toggle>
                        {appointment.status === "awaiting_clinical_results" && (
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                handleStatusConfirmation(appointment.id, "paraclinical_results_available")
                              }
                            >
                              Đã có kết quả xét nghiệm
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        )}
                      </Dropdown>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="me-2"
                        onClick={() => handleOpenModal(appointment, "edit")}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="warning"
                        onClick={() => handleOpenModal(appointment, "assignment")}
                      >
                        <i className="bi bi-gear"></i>
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
        <Modal show={modalVisible} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "edit" && "Kết quả xét nghiệm"}
              {modalType === "assignment" && "Chỉ định dịch vụ"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalType === "edit" && (
              <Form>
                <Form.Group>
                {examinationData.paraclinical_results ? (
                  <div>
                    <p>
                      <a
                        href={examinationData.paraclinical_results}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem kết quả
                      </a>
                    </p>
                  </div>
                ) : (
                  <p>Không có kết quả xét nghiệm nào.</p>
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
                  {services.map((service) => (
                    <Form.Check
                      key={service.id}
                      type="checkbox"
                      label={`${service.name} - ${service.price ? `${service.price.toLocaleString()} VND` : 'Liên hệ'}`}
                      checked={selectedServices.includes(service.id)}
                      readOnly
                      disabled
                    />
                  ))}
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            {modalType === "edit" && (
              <>
                <Button
                  variant="danger"
                  onClick={handleDeleteParaclinicalResult}
                >
                  Xóa
                </Button>
                <Button variant="primary" onClick={handleSaveExamination}>
                  Lưu
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default ParaclinicalResults;
