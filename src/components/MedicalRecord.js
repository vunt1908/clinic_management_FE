import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import Header from "./Header";

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    appointment: "",
    symptoms: "",
    diagnosis: "",
    results: "",
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/medical-records/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setRecords(response.data);
    } catch (error) {
      setErrorMessage("Không thể tải dữ liệu hồ sơ bệnh án.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (record = null) => {
    setSelectedRecord(record);
    if (record) {
      setFormData({
        appointment: record.appointment,
        symptoms: record.symptoms,
        diagnosis: record.diagnosis,
        results: record.results,
      });
    } else {
      setFormData({ appointment: "", symptoms: "", diagnosis: "", results: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = selectedRecord
      ? `http://127.0.0.1:8000/api/medical-records/${selectedRecord.id}/`
      : "http://127.0.0.1:8000/api/medical-records/";

    try {
      if (selectedRecord) {
        await axios.put(url, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setSuccessMessage("Cập nhật hồ sơ bệnh án thành công!");
      } else {
        await axios.post(url, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setSuccessMessage("Thêm mới hồ sơ bệnh án thành công!");
      }
      fetchRecords();
    } catch (error) {
      setErrorMessage("Không thể thực hiện hành động. Vui lòng thử lại.");
    } finally {
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/medical-records/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setSuccessMessage("Xóa hồ sơ bệnh án thành công!");
      fetchRecords();
    } catch (error) {
      setErrorMessage("Không thể xóa hồ sơ bệnh án.");
    }
  };

  return (
    <>
      <Header/>
      <div className="container mt-4">
        <h2>Hồ sơ bệnh án</h2>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Button onClick={() => handleShowModal()}>Thêm mới</Button>
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Triệu chứng</th>
              <th>Chẩn đoán</th>
              <th>Kết quả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.symptoms}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.results}</td>
                  <td>
                    <Button variant="warning" onClick={() => handleShowModal(record)}>
                      Sửa
                    </Button>{" "}
                    <Button variant="danger" onClick={() => handleDelete(record.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedRecord ? "Sửa hồ sơ bệnh án" : "Thêm mới hồ sơ bệnh án"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Triệu chứng</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Chẩn đoán</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Kết quả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="results"
                  value={formData.results}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Button type="submit">{selectedRecord ? "Cập nhật" : "Thêm mới"}</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default MedicalRecords;
