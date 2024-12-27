import React from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import doctorImage from '../assets/doctor.png';
import Header from './Header';
import Footer from './Footer';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getMainButton = () => {
    if (!user) {
      return (
        <Button variant="primary" onClick={() => navigate("/login")}>
          Đăng nhập để bắt đầu
        </Button>
      );
    }

    switch (user.role) {
      case "patient":
        return (
          <Button variant="primary" onClick={() => navigate("/appointments")}>
            Đặt lịch khám ngay
          </Button>
        );
      case "doctor":
        return (
          <Button variant="primary" onClick={() => navigate("/appointments/doctor")}>
            Xem danh sách đặt lịch
          </Button>
        );
      case "staff":
        return (
          <Button variant="primary" onClick={() => navigate("/receptions")}>
            Tiếp nhận bệnh nhân
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div
        className="hero-section pt-5 bg-light text-center"
        style={{
          height: "100vh",
          backgroundSize: "cover",
          position: "relative",
          backgroundPosition: "center",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-md-start">
              <h1 className="display-4 fw-bold">Your Health Is Our Top Priority</h1>
              <p className="lead">
                Securely share your comprehensive medical history with doctors and loved ones,
                for better communication and care.
              </p>
              {getMainButton()}
            </Col>
            <Col md={6}>
              <img
                src={doctorImage} 
                alt="Doctor"
                className="img-fluid"
                style={{ maxHeight: "400px" }}
              />
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default Home;