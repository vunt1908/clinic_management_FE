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
                <td>{appointment.reason}</td>
                <td>{{
                  pending: "Chờ xác nhận",
                  confirmed: "Đã xác nhận",
                  examining: "Đang khám",
                  completed: "Đã hoàn thành",
                  cancelled: "Đã hủy",
                }[appointment.status] || "Không có"}
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShow('edit', appointment)}
                    className="me-2"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleShow('delete', appointment)}
                  >
                    Xoá
                  </Button>
                </td>
              </tr>
            );
        })}
        </tbody>
      </Table>

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
                  <option value="examining">Đang khám</option>
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