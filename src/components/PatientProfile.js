import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Header from "./Header";

const PatientProfile = () => {
    const { user, token } = useAuth();
    const [profileData, setProfileData] = useState({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      gender: "",
      phone: "",
      dob: "",
      address: "",
      job: "",
    });
  
    const navigate = useNavigate();
  
    useEffect(() => {
      if (user) {
        fetchProfile();
      }
    }, [user]);
  
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/patients/${user.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData({
          username: response.data.user.username,
          email: response.data.user.email,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          gender: response.data.user.gender,
          phone: response.data.user.phone,
          dob: response.data.user.dob,
          address: response.data.user.address,
          job: response.data.user.job,
        });
      } catch (error) {
        console.error("Lỗi API", error);
      }
    };
  
    return (
      <>
          <Header />
          <Container>
          <Row className="justify-content-center">
              <Col md={6}>
              <h2 className="text-center mt-4">Thông tin cá nhân</h2>
              <Form>  
                <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={user.username}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control
                    type="text"
                    name="first_name"
                    value={user.last_name + " " +user.first_name}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Giới tính</Form.Label>
                <Form.Control
                    type="text"
                    name="gender"
                    value={user.gender}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                    type="text"
                    name="phone"
                    value={user.phone}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Ngày sinh</Form.Label>
                <Form.Control
                    type="date"
                    name="dob"
                    value={user.dob}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                    type="text"
                    name="address"
                    value={user.address}
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
  
  export default PatientProfile;
