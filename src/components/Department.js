import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import departmentLogo from '../assets/logo.png';
import Header from "./Header";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/departments/');
        setDepartments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu phòng khoa');
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleSelectDepartment = (department) => {
    setSelectedDepartment(department);
  };

  const handleBackToList = () => {
    setSelectedDepartment(null);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Container className="py-5">
        {!selectedDepartment ? (
          <Row xs={1} md={2} lg={3} className="g-4">
            {departments.map((department) => (
              <Col key={department.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={department.department_image || departmentLogo}
                    alt={department.name}
                    style={{ objectFit: 'cover', height: '200px' }}
                  />
                  <Card.Body>
                    <Card.Title
                      className="text-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectDepartment(department)}
                    >
                      {department.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center">
            <h2 className="text-primary">{selectedDepartment.name}</h2>
            <img
              src={selectedDepartment.department_image || departmentLogo}
              alt={selectedDepartment.name}
              className="my-3"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <p>{selectedDepartment.description || 'Không có mô tả'}</p>
            <Button variant="outline-secondary" onClick={handleBackToList}>
              Quay lại
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Department;
