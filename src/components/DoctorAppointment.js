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
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../fonts/roboto-regular";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2'

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [services, setServices] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [examinationData, setExaminationData] = useState({
    pathological_process: "",
    personal_history: "",
    family_history: "",
    symptoms: "",
    diagnosis: "",
    results: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [sortDate, setSortDate] = useState("desc");
  const [sortName, setSortName] = useState("asc");
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
  }, [user, navigate]);
  
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
          setExaminationData({
            pathological_process: examination.pathological_process || "",
            personal_history: examination.personal_history || "",
            family_history: examination.family_history || "",
            symptoms: examination.symptoms || "",
            diagnosis: examination.diagnosis || "",
            results: examination.results || "",
            paraclinical_results: examination.paraclinical_results || null,
          });
          setSelectedServices(examination.services || []);
        } else {
          setExaminationData({
            pathological_process: "",
            personal_history: "",
            family_history: "",
            symptoms: "",
            diagnosis: "",
            results: "",
          });
          setSelectedServices([]);
        }
      } catch (err) {
        console.error("Không thể tải thông tin khám bệnh:", err);
        setExaminationData({
          pathological_process: "",
          personal_history: "",
          family_history: "",
          symptoms: "",
          diagnosis: "",
          results: "",
        });
        setSelectedServices([]);
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
      results: "",
    });
    setSelectedServices([]);
    setModalType(null);
    setSelectedAppointment(null);
  };

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

  const handleExportInvoice = async () => {
    const doc = new jsPDF();
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");


    const currentYear = new Date().getFullYear();

    const title = "PHIẾU CHỈ ĐỊNH DỊCH VỤ KIÊM BẢNG KÊ CHI PHÍ";
    const titleWidth = doc.getTextWidth(title);  
    const pageWidth = doc.internal.pageSize.width;  
    const titleX = (pageWidth - titleWidth) / 2;

    doc.setFontSize(20);
    doc.text(title, titleX - 15, 20);
  
    try {
      const patientId = selectedAppointment?.patient;
  
      if (!patientId) {
        alert("Không tìm thấy thông tin bệnh nhân.");
        return;
      }
  
      const patientResponse = await axios.get(
        `http://127.0.0.1:8000/api/patients/${patientId}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      const patient = patientResponse.data.user || {};

      const doctorId = selectedAppointment?.doctor;
  
      if (!doctorId) {
        alert("Không tìm thấy thông tin bác sĩ.");
        return;
      }
  
      const doctorResponse = await axios.get(
        `http://127.0.0.1:8000/api/doctors/${doctorId}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      const doctor = doctorResponse.data || {};

      const appointmentId = selectedAppointment?.id;

      if (!appointmentId) {
        alert("Không tìm thấy thông tin cuộc hẹn.");
        return;
      }

      const examinationListResponse = await axios.get(
        `http://127.0.0.1:8000/api/examination/?appointment=${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );

      const examinationList = examinationListResponse.data || [];

      if (!examinationList || examinationList.length === 0) {
        alert("Không tìm thấy kết quả khám cho cuộc hẹn này.");
        return;
      }

      const examinationId = examinationList[0]?.id;

      if (!examinationId) {
        alert("Không tìm thấy thông tin khám cho cuộc hẹn này.");
        return;
      }

      const examinationResponse = await axios.get(
        `http://127.0.0.1:8000/api/examination/${examinationId}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );

      const examination = examinationResponse.data || {};

      if (!examination) {
        alert("Không tìm thấy thông tin khám bệnh.");
        return;
      }

      let genderText = "";
      if (patient.gender === "male") {
        genderText = "Nam";
      } else if (patient.gender === "female") {
        genderText = "Nữ";
      } else {
        genderText = "Khác";
      }
  
      const birthYear = patient.dob ? new Date(patient.dob).getFullYear() : null;
      const age = birthYear ? currentYear - birthYear : "Không xác định";

      const appointmentDate = selectedAppointment?.date;
      const formattedDate = appointmentDate !== "Không xác định"
        ? new Date(appointmentDate).toLocaleDateString("en-GB") 
        : "Không xác định";
  
      doc.setFontSize(12);
      doc.text(`Họ tên người bệnh: ${patient.last_name} ${patient.first_name || ""}`, 15, 40);
      doc.text(`Giới tính: ${genderText}`, 15, 50);
      doc.text(`Tuổi: ${age} tuổi`, 15, 60);
      doc.text(`Địa chỉ: ${patient.address || "Không có"}`, 15, 70); 
      doc.text(`Số điện thoại: ${patient.phone || "Không có"}`, 15, 80);
  
      const appointment = selectedAppointment || {};
      doc.text(`Ngày khám: ${formattedDate}`, 15, 90);
      doc.text(`Ca khám: ${appointment.time_slot}`, 15, 100);
      doc.text(`Lí do: ${appointment.reason || "Không có"}`, 15, 110);
      doc.text(`Ghi chú: ${appointment.notes || "Không có"}`, 15, 120);
      doc.text(`Chẩn đoán: ${examination.diagnosis || "Không có"}`, 15, 130);
      doc.text(`Kết quả: ${examination.results || "Không có"}`, 15, 140);
      doc.text(`Người in phiếu: ${doctor.user.last_name || ""} ${doctor.user.first_name || ""} - ${doctor.expertise || ""} - ${doctor.department_name || ""}`, 15, 150);
  
      const selectedServiceDetails = services
        .filter((service) => selectedServices.includes(service.id))
        .map((service) => [
          service.name || "Không xác định",
          service.price ? `${service.price.toLocaleString()} VND` : "Liên hệ",
        ]);
  
      doc.autoTable({
        head: [["Dịch vụ cận lâm sàng", "Giá tiền"]],
        body: selectedServiceDetails,
        startY: 160,
        styles: {
          font: "Roboto", 
        },
      });
  
      const totalPrice = services
        .filter((service) => selectedServices.includes(service.id))
        .reduce((sum, service) => sum + (service.price || 0), 0);
  
      doc.text(
        `Tổng số tiền phải thanh toán: ${totalPrice.toLocaleString()} VND`,
        20,
        doc.lastAutoTable.finalY + 10
      );
  
      doc.save("Phieu_thu_tien_kiem_bang_ke_chi_phi.pdf");
    } catch (error) {
      alert("Không thể lấy thông tin bệnh nhân hoặc xuất hóa đơn.");
    }
  };

  const handleSaveExamination = async () => {
    try {
      const payload = {
        pathological_process: examinationData?.pathological_process || "",
        personal_history: examinationData?.personal_history || "",
        family_history: examinationData?.family_history || "",
        symptoms: examinationData?.symptoms || "",
        diagnosis: examinationData?.diagnosis || "", 
        results: examinationData?.results || "",
        services: selectedServices,
      };

      if (selectedAppointment.examination) {
        await axios.patch(
          `http://127.0.0.1:8000/api/examination/${selectedAppointment.examination.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
      } else {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/examination/?appointment=${selectedAppointment.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
  
        if (response.data.length === 0) {
          await axios.post(
            `http://127.0.0.1:8000/api/examination/`,
            { ...payload, appointment: selectedAppointment.id },
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
        } else {
          await axios.patch(
            `http://127.0.0.1:8000/api/examination/${response.data[0].id}/`,
            payload,
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
        }
      }
  
      alert("Thông tin khám bệnh đã được cập nhật.");
      handleCloseModal();
      fetchData();
    } catch (err) {
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
      const payload = { services: selectedServices };
      let examinationId;
  
      if (selectedAppointment.examination) {
        examinationId = selectedAppointment.examination.id;
      } else {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/examination/?appointment=${selectedAppointment.id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
  
        if (response.data.length > 0) {
          examinationId = response.data[0].id;
        } 
      }
  
      if (!examinationId) {
        throw new Error("Examination ID không xác định.");
      }
  
      await axios.patch(
        `http://127.0.0.1:8000/api/examination/${examinationId}/`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
  
      const selectedServiceDetails = services.filter((service) =>
        selectedServices.includes(service.id)
      );
      const totalAmount = selectedServiceDetails.reduce(
        (sum, service) => sum + (service.price || 0),
        0
      );
  
      const examinationResponse = await axios.get(
        `http://127.0.0.1:8000/api/examination/${examinationId}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      const existingPayment = examinationResponse.data.payment;
  
      if (existingPayment) {
        await axios.patch(
          `http://127.0.0.1:8000/api/payments/${existingPayment}/`,
          { amount: totalAmount },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
      } else {
        const paymentResponse = await axios.post(
          `http://127.0.0.1:8000/api/payments/`,
          {
            patient: selectedAppointment.patient,
            amount: totalAmount,
            status: "pending",
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
  
        await axios.patch(
          `http://127.0.0.1:8000/api/examination/${examinationId}/`,
          { payment: paymentResponse.data.id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
      }
  
      alert("Dịch vụ và thông tin thanh toán đã được cập nhật.");
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert("Không thể lưu dịch vụ hoặc cập nhật thanh toán.");
    }
  };

    const [searchTerm, setSearchTerm] = useState("");

    const removeVietnamese = (str) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    };
  
    const handleSearch = (e) => {
      const value = removeVietnamese(e.target.value.toLowerCase());
      setSearchTerm(value);
  
      const rows = document.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const patientName = row.querySelector(".patient-name")?.innerText.toLowerCase() || "";
        const normalizePatientName = removeVietnamese(patientName.toLowerCase());
        if (normalizePatientName.includes(value)) {
          row.classList.remove("d-none"); 
        } else {
          row.classList.add("d-none"); 
        }
      });
    };

    const handleShowPatient = (patientId) => {
      const patient = patients[patientId];
      if (patient) {
        setSelectedPatient(patient);
        setShowModal(true);
      } else {
        console.error("Không tìm thấy thông tin bệnh nhân", patientId);
      }
    };

    const handleSortDate = () => {
      const sortedAppointments = [...appointments].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDate === "desc" ? dateB - dateA : dateA - dateB;
      });
      setAppointments(sortedAppointments);
      setSortDate(sortDate === "desc" ? "asc" : "desc"); 
    };

    const handleSortName = () => {
      const sortedAppointments = [...appointments].sort((a, b) => {
        const patientA = patients[a.patient]?.user.first_name || "";
        const patientB = patients[b.patient]?.user.first_name || "";
    
        if (sortName === "asc") {
          return patientA.localeCompare(patientB);
        } else {
          return patientB.localeCompare(patientA);
        }
      });
    
      setAppointments(sortedAppointments);
      setSortName(sortName === "asc" ? "desc" : "asc"); 
    };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Header />
      <Container className="mt-4">
        <h2 className="text-center mb-4">Danh sách khám bệnh</h2>

        <Form className="mb-4">
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Form>

        {appointments.length === 0 ? (
          <Alert variant="info">Không có lịch đặt khám nào.</Alert>
        ) : (
          <Table className="table-striped table-hover table-bordered shadow-sm rounded text-center">
            <thead className="bg-primary text-white">
              <tr>
                <th>STT</th>
                <th>
                  Tên bệnh nhân{" "}
                  <i
                    className={`bi ${sortName === "asc" ? "bi-sort-alpha-down" : "bi-sort-alpha-up"}`}
                    style={{ cursor: "pointer" }}
                    onClick={handleSortName}
                  ></i>
                </th>
                <th>
                  Ngày{" "}
                  <i
                    className={`bi ${sortDate === "desc" ? "bi-sort-up" : "bi-sort-down"}`}
                    style={{ cursor: "pointer" }}
                    onClick={handleSortDate}
                  ></i>
                </th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => {
                const patient = patients[appointment.patient];
                return (
                  <tr key={appointment.id}>
                    <td>{index + 1}</td>
                    <td
                        className="text-center text-primary patient-name"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleShowPatient(appointment.patient)}
                      >
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
                        <Dropdown.Toggle
                          className={`${
                            appointment.status === "pending"
                              ? "bg-secondary text-white"
                              : appointment.status === "confirmed"
                              ? "bg-primary text-white"
                              : appointment.status === "examining"
                              ? "bg-warning text-dark"
                              : appointment.status === "awaiting_clinical_results"
                              ? "bg-info text-white"
                              : appointment.status === "paraclinical_results_available"
                              ? "bg-success text-white"
                              : appointment.status === "completed"
                              ? "bg-success text-white"
                              : "bg-danger text-white"
                          }`}
                        >
                          {appointment.status === "pending"
                            ? "Chờ xác nhận"
                            : appointment.status === "confirmed"
                            ? "Đã xác nhận"
                            : appointment.status === "examining"
                            ? "Đang khám"
                            : appointment.status === "awaiting_clinical_results"
                            ? "Đang thực hiện xét nghiệm"
                            : appointment.status === "paraclinical_results_available"
                            ? "Đã có kết quả xét nghiệm"
                            : appointment.status === "completed"
                            ? "Hoàn tất"
                            : "Đã hủy"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {appointment.status === "pending" && (
                            <Dropdown.Item
                              onClick={() => handleStatusConfirmation(appointment.id, "confirmed")}
                            >
                              Xác nhận
                            </Dropdown.Item>
                          )}
                          {appointment.status === "confirmed" && (
                            <Dropdown.Item
                              onClick={() => handleStatusConfirmation(appointment.id, "examining")}
                            >
                              Đang khám
                            </Dropdown.Item>
                          )}
                          {appointment.status === "examining" && (
                            <>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusConfirmation(appointment.id, "awaiting_clinical_results")
                                }
                              >
                                Đang thực hiện xét nghiệm
                              </Dropdown.Item>
                              <Dropdown.Item
                              onClick={() =>
                                handleStatusConfirmation(appointment.id, "completed")
                              }
                            >
                              Hoàn tất
                            </Dropdown.Item>
                          </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td>
                    {appointment.status === "pending" || appointment.status === "confirmed" ? null : (
                      <>
                        {(appointment.status === "examining" || 
                          appointment.status === "awaiting_clinical_results" || 
                          appointment.status === "paraclinical_results_available") && (
                          <>
                            <Button
                              variant="success"
                              className="me-2"
                              onClick={() => handleOpenModal(appointment, "details")}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
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
                          </>
                        )}

                        {appointment.status === "completed" && (
                          <Button
                            variant="success"
                            className="me-2"
                            onClick={() => handleOpenModal(appointment, "details")}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                  </tr>
                );
              })}
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

      {modalVisible && (
        <Modal show={modalVisible} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "details" && "Chi tiết khám bệnh"}
              {modalType === "edit" && "Chỉnh sửa thông tin khám bệnh"}
              {modalType === "assignment" && "Chỉ định dịch vụ"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          {modalType === "details" && (
            <div>
              <p><strong>Lý do:</strong> {selectedAppointment.reason}</p>
              <p><strong>Ghi chú:</strong> {selectedAppointment.notes || "Không có"}</p>
              {examinationData ? (
                <>
                  <p><strong>Quá trình bệnh lý:</strong> {examinationData.pathological_process || "Không có thông tin"}</p>
                  <p><strong>Tiền sử cá nhân:</strong> {examinationData.personal_history || "Không có thông tin"}</p>
                  <p><strong>Tiền sử gia đình:</strong> {examinationData.family_history || "Không có thông tin"}</p>
                  <p><strong>Triệu chứng:</strong> {examinationData.symptoms || "Không có thông tin"}</p>
                  <p><strong>Chẩn đoán:</strong> {examinationData.diagnosis || " Không có thông tin"}</p>
                  <p><strong>Kết quả xét nghiệm:</strong> 
                     {examinationData.paraclinical_results ? (
                      <a href={examinationData.paraclinical_results} target="_blank" rel="noopener noreferrer"> Xem kết quả</a>
                    ) : " Không có"}
                  </p>
                  <p><strong>Kết quả:</strong> {examinationData.results || "Không có thông tin"}</p>
                </>
              ) : (
                <p>Không có thông tin khám bệnh.</p>
              )}
            </div>
          )}

            {modalType === "edit" && (
              <Form>
                <Form.Group>
                  <Form.Label>Quá trình bệnh lý</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={examinationData?.pathological_process || ""}
                    onChange={(e) =>
                      setExaminationData((prev) => ({
                        ...prev,
                        pathological_process: e.target.value,
                      }))
                    }
                    placeholder="Nhập quá trình bệnh lý"
                  />
                </Form.Group>
                
                <Form.Group>
                  <Form.Label>Tiền sử cá nhân</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={examinationData?.personal_history || ""}
                    onChange={(e) =>
                      setExaminationData((prev) => ({
                        ...prev,
                        personal_history: e.target.value,
                      }))
                    }
                    placeholder="Nhập tiền sử cá nhân"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Tiền sử gia đình</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={examinationData?.family_history || ""}
                    onChange={(e) =>
                      setExaminationData((prev) => ({
                        ...prev,
                        family_history: e.target.value,
                      }))
                    }
                    placeholder="Nhập tiền sử gia đình"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Triệu chứng</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={examinationData?.symptoms || ""}
                    onChange={(e) =>
                      setExaminationData((prev) => ({
                        ...prev,
                        symptoms: e.target.value,
                      }))
                    }
                    placeholder="Nhập triệu chứng"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Chẩn đoán</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={examinationData?.diagnosis || ""}
                    onChange={(e) =>
                      setExaminationData((prev) => ({
                        ...prev,
                        diagnosis: e.target.value,
                      }))
                    }
                    placeholder="Nhập chẩn đoán"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Kết quả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={examinationData?.results || ""}
                    onChange={(e) =>
                      setExaminationData((prev) => ({
                        ...prev, results: e.target.value }))
                    }
                    placeholder="Nhập kết quả"
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
                      onChange={() => handleServiceToggle(service.id)} 
                    />
                  ))}
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            {modalType === "details" && (
              <Button variant="success" onClick={handleExportInvoice}>
                In phiếu
              </Button>
            )}
            {modalType === "edit" && (
              <Button variant="primary" onClick={handleSaveExamination}>
                Lưu
              </Button>
            )}
            {modalType === "assignment" && (
              <>
                <Button variant="success" onClick={handleExportInvoice}>
                  In phiếu
                </Button>
                <Button variant="primary" onClick={handleSaveServices}>
                  Lưu
                </Button>
              </>
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

export default DoctorAppointments;
