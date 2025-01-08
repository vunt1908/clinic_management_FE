import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Header from "./Header";

const DoctorProfile = () => {
    const { user, token } = useAuth();
    const [profileData, setProfileData] = useState({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      gender: "",
    });
  
    const navigate = useNavigate();
  
    useEffect(() => {
      if (user) {
        fetchProfile();
      }
    }, [user]);
  
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/doctors/${user.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData({
          username: response.data.user.username,
          email: response.data.user.email,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
        });
      } catch (error) {
        console.error("Lỗi API", error);
      }
    };
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProfileData({ ...profileData, [name]: value });
    };
  
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          `http://127.0.0.1:8000/api/doctors/${user.id}/`,
          { user: profileData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Thông tin cá nhân đã được cập nhật thành công!");
        navigate("/");
      } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật thông tin cá nhân.");
      }
    };
  
    return (
      <>
          <Header />
          <Container>
          <Row className="justify-content-center">
              <Col md={6}>
              <h2 className="text-center mt-4">Thông tin cá nhân</h2>
              <Form onSubmit={handleFormSubmit}>  
                <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={user.username}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Tên</Form.Label>
                <Form.Control
                    type="text"
                    name="first_name"
                    value={user.last_name + " " +user.first_name}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Giới tính</Form.Label>
                <Form.Control
                    type="text"
                    name="gender"
                    value={user.gender}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                    type="text"
                    name="phone"
                    value={user.phone}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Ngày sinh</Form.Label>
                <Form.Control
                    type="date"
                    name="dob"
                    value={user.dob}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                    type="text"
                    name="address"
                    value={user.address}
                    onChange={handleInputChange}
                    disabled
                />
                </Form.Group>

                <Button className="me-2" variant="primary" type="submit">
                Thay đổi mật khẩu
                </Button>

                <Button className="mr-2" variant="primary" type="submit">
                Cập nhật thông tin cá nhân
                </Button>
              </Form>
              </Col>
          </Row>
          </Container>
      </>
    );
  };
  
  export default DoctorProfile;
