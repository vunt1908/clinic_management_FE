import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import Header from '../Header'; 

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    gender: '',
    phone: '',
    dob: '',
    job: '',
    address: '',
    role: 'patient', 
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập username';
    if (!formData.password.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (!formData.first_name.trim()) newErrors.first_name = 'Vui lòng nhập tên';
    if (!formData.last_name.trim()) newErrors.last_name = 'Vui lòng nhập họ và tên đệm';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.dob.trim()) newErrors.dob = 'Vui lòng nhập ngày sinh';
    if (!formData.job.trim()) newErrors.job = 'Vui lòng nhập nghề nghiệp';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        role: formData.role, 
      };

      const patientData = {
        user: userData,
        job: formData.job,
      };

      await axios.post('http://127.0.0.1:8000/api/patients/', patientData);
      alert('Đăng kí tài khoản thành công!');
      navigate('/login');
    } catch (error) {
      if (error.response?.data) {
        setErrors({
          general:
            typeof error.response.data === 'string'
              ? error.response.data
              : 'Có lỗi trong quá trình đăng kí.',
        });
      } else {
        setErrors({
          general: 'Có lỗi trong quá trình đăng kí. Vui lòng thử lại!',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-5">
        <div className="col-md-8 mx-auto">
          <h2 className="text-center mb-4">Đăng ký tài khoản</h2>
          <Form onSubmit={handleSubmit}>
            {errors.general && (
              <Alert variant="danger">{errors.general}</Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
                placeholder="Nhập username"
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="Nhập email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder="Nhập mật khẩu"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex mb-3">
            <div className="flex-fill me-2">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                isInvalid={!!errors.first_name}
                placeholder="Nhập tên"
              />
              <Form.Control.Feedback type="invalid">
                {errors.first_name}
              </Form.Control.Feedback>
            </div>
            <div className="flex-fill ms-2">
              <Form.Label>Họ và tên đệm</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                isInvalid={!!errors.last_name}
                placeholder="Nhập họ và tên đệm"
              />
              <Form.Control.Feedback type="invalid">
                {errors.last_name}
              </Form.Control.Feedback>
            </div>
          </div>

            <Form.Group className="mb-3">
              <Form.Label>Giới tính</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                isInvalid={!!errors.gender}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.gender}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
                placeholder="Nhập số điện thoại"
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                isInvalid={!!errors.dob}
              />
              <Form.Control.Feedback type="invalid">
                {errors.dob}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nghề nghiệp</Form.Label>
              <Form.Control
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                isInvalid={!!errors.job}
                placeholder="Nhập nghề nghiệp"
              />
              <Form.Control.Feedback type="invalid">
                {errors.job}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                as="textarea"
                name="address"
                value={formData.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                placeholder="Nhập địa chỉ"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </Button>

            <div className="text-center mt-3">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-decoration-none">
                Đăng nhập
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Register;
