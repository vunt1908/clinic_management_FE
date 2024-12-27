import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const ManageDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    gender: '',
    phone: '',
    dob: '',
    address: '',
    expertise: '',
    department: '', 
  });

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/doctors/');
      setDoctors(response.data);
    } catch (error) {
      console.error('Lỗi API bác sĩ', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/departments/'); 
      setDepartments(response.data);
    } catch (error) {
      console.error('Lỗi API khoa khám bệnh', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setSelectedDoctor(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      gender: '',
      phone: '',
      dob: '',
      address: '',
      expertise: '',
      department: '',
    });
  };

  const handleShow = (type, doctor = null) => {
    setModalType(type);
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData({
        username: doctor.user.username,
        email: doctor.user.email,
        first_name: doctor.user.first_name,
        last_name: doctor.user.last_name,
        gender: doctor.user.gender,
        phone: doctor.user.phone,
        dob: doctor.user.dob,
        address: doctor.user.address,
        expertise: doctor.expertise,
        department: doctor.department.id,
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
      const doctorData = {
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
          role: 'doctor', 
        },
        expertise: formData.expertise,
        department: formData.department,
      };

      if (modalType === 'add') {
        doctorData.user.username = formData.username;
        const response = await axios.post(
          'http://127.0.0.1:8000/api/doctors/',
          doctorData
        );
        if (response.status === 201) {
          alert('Thêm mới bác sĩ thành công!');
          fetchDoctors();
        }
      } else if (modalType === 'edit') {
        const response = await axios.patch(
          `http://127.0.0.1:8000/api/doctors/${selectedDoctor.id}/`,
          doctorData
        );
        if (response.status === 200) {
          alert('Cập nhật thông tin bác sĩ thành công!');
          fetchDoctors();
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
        `http://127.0.0.1:8000/api/doctors/${selectedDoctor.id}/`
      );
      if (response.status === 204) {
        fetchDoctors();
        handleClose();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách bác sỹ</h2>
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
            <th>Chuyên môn</th>
            <th>Khoa</th>
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.user.username}</td>
              <td>{doctor.user.email}</td>
              <td>{doctor.user.last_name} {doctor.user.first_name}</td>
              <td>{{
                male: "Nam",
                female: "Nữ",
                other: "Khác",
              }[doctor.user.gender] || "Không có"}
              </td>
              <td>{doctor.expertise}</td>
              <td>{doctor.department_name}</td>
              <td>{doctor.user.phone}</td>
              <td>
                {doctor.user.dob ? new Date(doctor.user.dob).toLocaleDateString('en-GB') : "Đang tải..."}
              </td>
              <td>{doctor.user.address}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleShow('edit', doctor)}
                  className="me-2"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShow('delete', doctor)}
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
              ? 'Thêm mới bác sĩ'
              : modalType === 'edit'
              ? 'Chỉnh sửa bác sĩ'
              : 'Xoá bác sĩ'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'delete' ? (
            <p>Bạn có chắc chắn muốn xoá bác sĩ này?</p>
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
                <Form.Label>Họ và tên đệm</Form.Label>
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
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Chuyên môn</Form.Label>
                <Form.Control
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Khoa khám bệnh</Form.Label>
                <Form.Control
                  as="select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Lựa chọn khoa khám bệnh</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit">
                {modalType === 'add' ? 'Thêm mới bác sĩ' : 'Lưu thay đổi'}
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

export default ManageDoctor;
