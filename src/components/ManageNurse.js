import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const ManageNurse = () => {
  const [nurses, setNurses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: '',
    first_name: '',
    last_name: '',
    phone: '',
    dob: '',
    address: '',
  });

  const fetchNurses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/nurses/');
      setNurses(response.data);
    } catch (error) {
      console.error('Lỗi API y tá', error);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setSelectedNurse(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      gender:'',
      first_name: '',
      last_name: '',
      phone: '',
      dob: '',
      address: '',
    });
  };

  const handleShow = (type, nurse = null) => {
    setModalType(type);
    if (nurse) {
      setSelectedNurse(nurse);
      setFormData({
        username: nurse.user.username,
        email: nurse.user.email,
        gender: nurse.user.gender,
        first_name: nurse.user.first_name,
        last_name: nurse.user.last_name,
        phone: nurse.user.phone,
        dob: nurse.user.dob,
        address: nurse.user.address,
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
      const nurseData = {
        user: {
          // username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          dob: formData.dob,
          address: formData.address,
          role: 'nurse',
        },
      };

      if (modalType === 'add') {
        nurseData.user.username = formData.username;
        const response = await axios.post(
          'http://127.0.0.1:8000/api/nurses/',
          nurseData
        );
        if (response.status === 201) {
          alert('Thêm mới y tá thành công!');
          fetchNurses();
        }
      } else if (modalType === 'edit') {
        const response = await axios.patch(
          `http://127.0.0.1:8000/api/nurses/${selectedNurse.id}/`,
          nurseData
        );
        if (response.status === 200) {
          alert('Cập nhật thông tin y tá thành công!');
          fetchNurses();
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
        `http://127.0.0.1:8000/api/nurses/${selectedNurse.id}/`
      );
      if (response.status === 204) {
        alert('Xoá y tá thành công!');
        fetchNurses();
        handleClose();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách y tá</h2>
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
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {nurses.map((nurse) => (
            <tr key={nurse.id}>
              <td>{nurse.user.username}</td>
              <td>{nurse.user.email}</td>
              <td>{nurse.user.last_name} {nurse.user.first_name}</td>
              <td>{{
                male: "Nam",
                female: "Nữ",
                other: "Khác",
              }[nurse.user.gender] || "Không có"}
              </td>
              <td>{nurse.user.phone}</td>
              <td>
                {nurse.user.dob ? new Date(nurse.user.dob).toLocaleDateString('en-GB') : "Đang tải..."}
              </td>
              <td>{nurse.user.address}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleShow('edit', nurse)}
                  className="me-2"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShow('delete', nurse)}
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
              ? 'Thêm mới y tá'
              : modalType === 'edit'
              ? 'Chỉnh sửa y tá'
              : 'Xoá y tá'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'delete' ? (
            <p>Bạn có chắc chắn muốn xoá y tá này?</p>
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
              <Button variant="primary" type="submit">
                {modalType === 'add' ? 'Thêm mới y tá' : 'Lưu thay đổi'}
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

export default ManageNurse;
