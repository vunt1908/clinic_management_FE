import React from 'react';
import { useEffect } from 'react';
import { Navbar, Nav, Button, Dropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "manager") {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  if (user?.role === "manager") {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderAuthOptions = () => {
    if (!user) {
      return (
        <>
          <Button variant="outline-primary" onClick={() => navigate("/login")} className="me-2">
            Đăng nhập
          </Button>
          <Button variant="primary" onClick={() => navigate("/register")}>
            Đăng ký
          </Button>
        </>
      );
    }

    const userDropdownItems = {
      patient: [
        { label: "Xem Profile", path: "/profile" },
        { label: "Lịch sử đặt lịch", path: "/appointments/history" },
        { label: "Lịch sử khám bệnh", path: "/patient-examination" },
      ],
      doctor: [
        { label: "Xem Profile", path: "/doctor-profile" },
      ],
      staff: [
        { label: "Xem Profile", path: "/profile" },
      ],
      nurse: [
        { label: "Xem Profile", path: "/profile" },
      ],
    };

    return (
      <Dropdown align="end">
        <Dropdown.Toggle variant="outline-primary" id="user-dropdown">
          {user.username}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {userDropdownItems[user.role]?.map((item, idx) => (
            <Dropdown.Item key={idx} onClick={() => navigate(item.path)}>
              {item.label}
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout} className="text-danger">
            Đăng xuất
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <Navbar expand="lg" bg="light" className="shadow-sm">
      <Container>
        <Navbar.Brand onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          Clinic
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/")}>Trang chủ</Nav.Link>
            <Nav.Link onClick={() => navigate("/departments")}>Phòng khoa</Nav.Link>
            <Nav.Link onClick={() => navigate("/doctors")}>Bác sĩ</Nav.Link>
            {user?.role === "patient" && (
              <Nav.Link onClick={() => navigate("/appointments")}>Đặt lịch khám bác sĩ</Nav.Link>
            )}
            {user?.role === "doctor" && (
              <>
                <Nav.Link onClick={() => navigate("/appointments/doctor")}>
                  Danh sách khám bệnh
                </Nav.Link>
              </>
            )}
            {user?.role === "staff" && (
              <>
                <Nav.Link onClick={() => navigate("/appointments/staff")}>
                  Danh sách đặt lịch khám
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/receptions")}>
                  Tiếp nhận bệnh nhân
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/staff-examination")}>
                  Thanh toán
                </Nav.Link>
              </>
            )}
            {user?.role === "nurse" && (
              <>
                <Nav.Link onClick={() => navigate("/paraclinicalresults")}>
                  Kết quả xét nghiệm
                </Nav.Link>
              </>
            )}
          </Nav>
          {renderAuthOptions()}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
