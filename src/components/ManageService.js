import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";

const ManageService = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const handleClose = () => {
    setShowModal(false);
    setSelectedService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
    });
  };

  const handleShow = (type, service = null) => {
    setModalType(type);
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
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
      if (modalType === "add") {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/services/",
          formData
        );
        if (response.status === 201) {
          fetchServices();
        }
      } else if (modalType === "edit") {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/services/${selectedService.id}/`,
          formData
        );
        if (response.status === 200) {
          fetchServices();
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
        `http://127.0.0.1:8000/api/services/${selectedService.id}/`
      );
      if (response.status === 204) {
        fetchServices();
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/services/");
      setServices(response.data);
    } catch (error) {
      console.error("Lỗi API dịch vụ", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const renderForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Tên dịch vụ</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nhập tên dịch vụ"
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
          placeholder="Nhập mô tả dịch vụ"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Giá dịch vụ</Form.Label>
        <Form.Control
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          placeholder="Nhập giá dịch vụ"
        />
      </Form.Group>
    </Form>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý dịch vụ cận lâm sàng</h2>
        <Button variant="primary" onClick={() => handleShow("add")}>
          Thêm mới dịch vụ
        </Button>
      </div>

      <Table striped bordered hover responsive className='text-center'>
        <thead>
          <tr>
            <th>Tên dịch vụ</th>
            <th>Mô tả</th>
            <th>Giá dịch vụ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.description}</td>
              <td>{service.price}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShow("edit", service)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShow("delete", service)}
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
            {modalType === "add"
              ? "Thêm mới dịch vụ"
              : modalType === "edit"
              ? "Chỉnh sửa dịch vụ"
              : "Xoá dịch vụ"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "delete" ? (
            <p>Bạn có chắc chắn muốn xoá dịch vụ này?</p>
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
              {modalType === "add" ? "Thêm mới dịch vụ" : "Lưu"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageService;
