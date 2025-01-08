import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const ManageAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [examination, setExamination] = useState(null);
  const [payment, setPayment] = useState(null);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    doctor: '',
    patient: '',
    start_time: '',
    end_time: '',
    date: '',
    notes: '',
    reason: '',
    status: ''
  });

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/doctors/');
      setDoctors(response.data);
    } catch (error) {
      console.error('Lỗi API bác sĩ', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/patients/');
      setPatients(response.data);
    } catch (error) {
      console.error('Lỗi API bệnh nhân', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/appointments/');
      setAppointments(response.data);
    } catch (error) {
      console.error('Lỗi API lịch hẹn', error);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
  
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/appointments/available_slots/', {
        params: { doctor: doctorId, date }
      });
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ca khám khả dụng:', error);
    }
  };

  const fetchService = async (serviceIds) => {
    try {
      const serviceResponses = await Promise.all(
        serviceIds.map((id) =>
          axios.get(`http://127.0.0.1:8000/api/services/${id}/`)
        )
      );
      setServices(serviceResponses.map((response) => response.data));
    } catch (error) {
      console.error("Lỗi API dịch vụ", error);
    }
  };

  const fetchPayment = async (paymentId) => {
    try {
      const paymentResponse = await axios.get(
        `http://127.0.0.1:8000/api/payments/${paymentId}/`
      );
      return paymentResponse.data;
    } catch (error) {
      console.error("Lỗi API thanh toán", error);
      return null;
    }
  };

  const fetchExamination = async (appointmentId) => {
    try {
      const examinationResponse = await axios.get(
        `http://127.0.0.1:8000/api/examination/`,
        { params: { appointment: appointmentId } }
      );
  
      if (examinationResponse.data.length > 0) {
        const examination = examinationResponse.data[0];
        setExamination(examination);

        await fetchService(examination.services); 
        const paymentData = await fetchPayment(examination.payment);
        setPayment(paymentData);
      } else {
        alert("Không tìm thấy thông tin khám bệnh.");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi tải thông tin khám bệnh.");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    if (formData.doctor && formData.date) {
      fetchAvailableSlots(formData.doctor, formData.date);
    }
  }, [formData.doctor, formData.date]);

  const handleClose = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setFormData({
      doctor: '',
      patient: '',
      time_slot: '',
      date: '',
      notes: '',
      reason: '',
      status: ''
    });
  };

  const handleShow = (type, appointment = null) => {
    setModalType(type);
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        doctor: appointment.doctor,
        patient: appointment.patient,
        time_slot: appointment.time_slot,
        date: appointment.date,
        notes: appointment.notes,
        reason: appointment.reason,
        status: appointment.status
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/appointments/',
          formData
        );
        if (response.status === 201) {
          alert('Thêm mới lịch hẹn thành công!');
          fetchAppointments();
        }
      } else if (modalType === 'edit') {
        const response = await axios.patch(
          `http://127.0.0.1:8000/api/appointments/${selectedAppointment.id}/`,
          formData
        );
        if (response.status === 200) {
          alert('Cập nhật lịch hẹn thành công!');
          fetchAppointments();
        }
      }
      handleClose();
    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu:', error);
      alert('Có lỗi xảy ra khi gửi dữ liệu. Vui lòng kiểm tra thông tin.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/appointments/${selectedAppointment.id}/`
      );
      if (response.status === 204) {
        fetchAppointments();
        handleClose();
      }
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách lịch hẹn</h2>
        <Button variant="primary" onClick={() => handleShow('add')}>
          Thêm mới
        </Button>
      </div>

      <Table striped bordered hover responsive className='text-center'>
        <thead>
          <tr>
            <th>Bác sĩ</th>
            <th>Bệnh nhân</th>
            <th>Ngày</th>
            <th>Thời gian khám</th>
            <th>Lý do</th>
            <th>Ghi chú</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const doctor = doctors.find((doc) => doc.id === appointment.doctor);
            const patient = patients.find((pat) => pat.id === appointment.patient);
            return (
              <tr key={appointment.id}>
                <td>
                    {doctor
                      ? `${doctor.user.last_name} ${doctor.user.first_name}`
                      : "Đang tải..."}
                </td>
                <td>
                    {patient
                      ? `${patient.user.last_name} ${patient.user.first_name}`
                      : "Đang tải..."}
                </td>
                <td>
                  {appointment.date ? new Date(appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                </td>
                <td>{appointment.time_slot}</td>
                <td>{appointment.reason || "Không có"}</td>
                <td>{appointment.notes || "Không có"}</td>
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
                <td>
                  {(appointment.status === "paraclinical_results_available" || appointment.status === "completed") && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => fetchExamination(appointment.id)}
                      className="me-2"
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                  )}
                  {appointment.status === "pending" && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleShow('edit', appointment)}
                      className="me-2"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShow('delete', appointment)}
                  >
                    <i class="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            );
        })}
        </tbody>
      </Table>

      <Modal show={!!examination} onHide={() => setExamination(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin khám bệnh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {examination ? (
            <div>
              <p><strong>Quá trình bệnh lý:</strong> {examination.pathological_process}</p>
              <p><strong>Tiền sử cá nhân:</strong> {examination.personal_history}</p>
              <p><strong>Tiền sử gia đình:</strong> {examination.family_history}</p>
              <p><strong>Triệu chứng:</strong> {examination.symptoms}</p>
              <p><strong>Chẩn đoán:</strong> {examination.diagnosis}</p>
              <p><strong>Kết quả:</strong> {examination.results}</p>
              <p><strong>Kết quả xét nghiệm:</strong> 
                  {examination.paraclinical_results ? (
                  <a href={examination.paraclinical_results} target="_blank" rel="noopener noreferrer"> Xem kết quả</a>
                ) : " Không có"}
              </p>
              <h5>Dịch vụ đã sử dụng</h5>
              {services.length > 0 ? (
                <ul>
                  {services.map((service) => (
                    <li key={service.id}>
                      {service.name} - {parseFloat(service.price).toLocaleString()} VND
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có.</p>
              )}
              <p>
                <strong>Tổng số tiền:</strong>{" "}
                {payment ? `${parseFloat(payment.amount).toLocaleString()} VND` : "Không có thông tin thanh toán"}
              </p>
            </div>
          ) : (
            <p>Không có thông tin khám bệnh.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setExamination(null)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add'
              ? 'Thêm mới lịch hẹn'
              : modalType === 'edit'
              ? 'Chỉnh sửa lịch hẹn'
              : 'Xoá lịch hẹn'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'delete' ? (
            <p>Bạn có chắc chắn muốn xoá lịch hẹn này?</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Bác sĩ</Form.Label>
                <Form.Control
                  as="select"
                  name="doctor"
                  value={formData.doctor}
                  onChange={(e) => {
                      handleChange(e);
                      setFormData((prev) => ({ ...prev, time_slot: '' }));
                      setAvailableSlots([]);
                    }
                  }
                  required
                  disabled={modalType === 'edit'}
                >
                  <option value="">Chọn bác sĩ</option>
                  {doctors.map((doct) => (
                    <option key={doct.id} value={doct.id}>
                      {doct.user.last_name} {doct.user.first_name} - {doct.expertise}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bệnh nhân</Form.Label>
                <Form.Control
                  as="select"
                  name="patient"
                  value={formData.patient}
                  onChange={(e) => {
                      handleChange(e);
                      setFormData((prev) => ({ ...prev, time_slot: '' })); 
                      setAvailableSlots([]);
                    }
                  }
                  required
                  disabled={modalType === 'edit'}
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.user.last_name} {p.user.first_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ngày khám</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => {
                      handleChange(e);
                      fetchAvailableSlots(formData.doctor, e.target.value);
                    }
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ca khám</Form.Label>
                <Form.Control
                  as="select"
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleChange}
                  required
                  disabled={!availableSlots.length}
                >
                  <option value="">Chọn ca khám</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Lí do</Form.Label>
                <Form.Control
                  as="textarea"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">Đang chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã huỷ</option>
                </Form.Select>
              </Form.Group>

              <Button variant="primary" type="submit">
                {modalType === 'add' ? 'Thêm mới lịch hẹn' : 'Lưu thay đổi'}
              </Button>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Huỷ
          </Button>
          {modalType === 'delete' && (
            <Button variant="danger" onClick={handleDelete}>
              Xoá
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAppointment;