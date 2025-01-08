import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";

const ManageDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department_image: null,
  });

  const handleClose = () => {
    setShowModal(false);
    setSelectedDepartment(null);
    setFormData({
      name: "",
      description: "",
      department_image: null,
    });
  };

  const handleShow = (type, department = null) => {
    setModalType(type);
    if (department) {
      setSelectedDepartment(department);
      setFormData({
        name: department.name,
        description: department.description,
        department_image: department.department_image || null,
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value , files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formData.department_image && modalType === "add") {
      data.append("department_image", formData.department_image);
    }

    try {
      if (modalType === "add") {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/departments/",
          data
        );
        if (response.status === 201) {
          fetchDepartments();
        }
      } else if (modalType === "edit") {
        if (formData.department_image && formData.department_image !== selectedDepartment.department_image) {
          data.append("department_image", formData.department_image);
        }
        const response = await axios.put(
          `http://127.0.0.1:8000/api/departments/${selectedDepartment.id}/`,
          data
        );
        if (response.status === 200) {
          fetchDepartments();
        }
      }
      handleClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/departments/${selectedDepartment.id}/`
      );
      if (response.status === 204) {
        fetchDepartments();
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/departments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Lỗi API khoa", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const renderForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Tên khoa</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nhập tên khoa"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Mô tả</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Hình ảnh khoa</Form.Label>
        <Form.Control
          type="file"
          name="department_image"
          onChange={handleChange}
          accept="image/*"
        />
        {formData.department_image && modalType === "edit" && (
          <div className="mt-2">
            <img
              src={formData.department_image}
              alt="Hình ảnh khoa"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </div>
        )}
      </Form.Group>
    </Form>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý khoa khám bệnh</h2>
        <Button variant="primary" onClick={() => handleShow("add")}>
          Thêm mới khoa khám bệnh
        </Button>
      </div>

      <Table striped bordered hover responsive className='text-center'>
        <thead>
          <tr>
            <th>Hình ảnh khoa</th>
            <th>Tên khoa</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id}>
              <td>
                {department.department_image && (
                  <img
                    src={department.department_image}
                    alt="Hình ảnh khoa"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                )}
              </td>
              <td>{department.name}</td>
              <td>{department.description}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShow("edit", department)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShow("delete", department)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add"
              ? "Thêm mới khoa khám bệnh"
              : modalType === "edit"
              ? "Chỉnh sửa khoa khám bệnh"
              : "Xoá khoa khám bệnh"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "delete" ? (
            <p>Bạn có chắc chắn muốn xoá khoa khám bệnh này?</p>
          ) : (
            renderForm()
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Huỷ
          </Button>
          {modalType === "delete" ? (
            <Button variant="danger" onClick={handleDelete}>
              Xoá
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit}>
              {modalType === "add" ? "Thêm mới khoa khám bệnh" : "Lưu"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageDepartment;
