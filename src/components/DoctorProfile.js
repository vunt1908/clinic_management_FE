import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';

const DoctorProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      navigate("/login");
      return;
    }

    const fetchDoctorInfo = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/doctors/`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const doctor = response.data.find((d) => d.user.id === user.id);
        if (doctor) {
          setDoctorInfo(doctor);
          setFormData({
            expertise: doctor.expertise || "",
            department: doctor.department || null,
            doctor_image: doctor.doctor_image || null,
          });
        } else {
          console.log("Không tìm thấy thông tin bác sĩ với ID người dùng:", user.id);
          setDoctorInfo(null); 
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bác sĩ:", error);
        setLoading(false);
      }
    };

    fetchDoctorInfo();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/doctors/${doctorInfo.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setDoctorInfo(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin bác sĩ:", error);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mt-5">
        <Col md={4} className="text-center">
          <Image
            src={doctorInfo.doctor_image || "/default-avatar.png"}
            roundedCircle
            fluid
            className="mb-4"
            style={{ width: "200px", height: "200px", objectFit: "cover" }}
          />
        </Col>
        <Col md={8}>
          <h3>Thông tin bác sĩ</h3>
          <Form>
            <Form.Group controlId="expertise" className="mb-3">
              <Form.Label>Chuyên môn</Form.Label>
              <Form.Control
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </Form.Group>
            <Form.Group controlId="department" className="mb-3">
              <Form.Label>Khoa</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={doctorInfo.department_name || ""}
                readOnly
              />
            </Form.Group>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={doctorInfo.user.email} readOnly />
            </Form.Group>
            <Form.Group controlId="phone" className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control type="text" value={doctorInfo.user.phone} readOnly />
            </Form.Group>
          </Form>
          {isEditing ? (
            <div>
              <Button variant="primary" onClick={handleSaveChanges} className="me-2">
                Lưu thay đổi
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
            </div>
          ) : (
            <Button variant="warning" onClick={() => setIsEditing(true)}>
              Chỉnh sửa thông tin
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorProfile;
