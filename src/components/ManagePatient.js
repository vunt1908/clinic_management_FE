import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const ManagePatient = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    gender: '',
    phone: '',
    dob: '',
    job: '',
    address: '',
  });

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/patients/');
      setPatients(response.data);
    } catch (error) {
      console.error('Lỗi API bệnh nhân', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setSelectedPatient(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      gender: '',
      phone: '',
      dob: '',
      job: '',
      address: '',
    });
  };

  const handleShow = (type, patient = null) => {
    setModalType(type);
    if (patient) {
      setSelectedPatient(patient);
      setFormData({
        username: patient.user.username,
        email: patient.user.email,
        first_name: patient.user.first_name,
        last_name: patient.user.last_name,
        gender: patient.user.gender,
        phone: patient.user.phone,
        dob: patient.user.dob,
        job: patient.job,
        address: patient.user.address,
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
      const patientData = {
        user: {
          // username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          phone: formData.phone,
          dob: formData.dob,
          address: formData.address,
          role: 'patient',
        },
        job: formData.job,
      };

      if (modalType === 'add') {
        patientData.user.username = formData.username;
        const response = await axios.post(
          'http://127.0.0.1:8000/api/patients/',
          patientData
        );
        if (response.status === 201) {
          alert('Thêm mới bệnh nhân thành công!');
          fetchPatients();
        }
      } else if (modalType === 'edit') {
        const response = await axios.patch(
          `http://127.0.0.1:8000/api/patients/${selectedPatient.id}/`,
          patientData
        );
        if (response.status === 200) {
          alert('Cập nhật thông tin bệnh nhân thành công!');
          fetchPatients();
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
        `http://127.0.0.1:8000/api/patients/${selectedPatient.id}/`
      );
      if (response.status === 204) {
        alert('Xoá bệnh nhân thành công!');
        fetchPatients();
        handleClose();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách bệnh nhân</h2>
        <Button variant="primary" onClick={() => handleShow('add')}>
          Thêm mới
        </Button>
      </div>

      <Table striped bordered hover responsive className='text-center'>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Họ và tên</th>
            <th>Giới tính</th>
            <th>Ngày sinh</th>
            <th>Số điện thoại</th>
            <th>Nghề nghiệp</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.user.username}</td>
              <td>{patient.user.email}</td>
              <td>{patient.user.last_name} {patient.user.first_name}</td>
              <td>{{
                male: "Nam",
                female: "Nữ",
                other: "Khác",
              }[patient.user.gender] || "Không có"}
              </td>
              <td>
                {patient.user.dob ? new Date(patient.user.dob).toLocaleDateString('en-GB') : "Đang tải..."}
              </td>
              <td>{patient.user.phone}</td>
              <td>{patient.job || "Không có"}</td>
              <td>{patient.user.address}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleShow('edit', patient)}
                  className="me-2"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShow('delete', patient)}
                >
                  Xoá
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add'
              ? 'Thêm mới bệnh nhân'
              : modalType === 'edit'
              ? 'Chỉnh sửa bệnh nhân'
              : 'Xoá bệnh nhân'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'delete' ? (
            <p>Bạn có chắc chắn muốn xoá bệnh nhân này?</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  readOnly={modalType === 'edit'} 
                  required={modalType === 'add'}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={modalType === 'add'}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tên</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Họ</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Giới tính</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ngày sinh</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nghề nghiệp</Form.Label>
                <Form.Control
                  type="text"
                  name="job"
                  value={formData.job}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                {modalType === 'add' ? 'Thêm mới bệnh nhân' : 'Lưu thay đổi'}
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

export default ManagePatient;
