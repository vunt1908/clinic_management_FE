import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import Header from '../Header';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username không được để trống';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
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
      const response = await axios.post('http://127.0.0.1:8000/auth/login/', formData);
      
      localStorage.setItem('accessToken', response.data.data.tokens.access);
      localStorage.setItem('refreshToken', response.data.data.tokens.refresh);
      
      await login(response.data.data.user);
      navigate('/');
    } catch (error) {
      if (error.response?.data) {
        setErrors({
          general: typeof error.response.data === 'string' 
            ? error.response.data 
            : 'Có lỗi trong quá trình đăng nhập.'
        });
      } else {
        setErrors({
          general: 'Có lỗi trong quá trình đăng nhập. Vui lòng thử lại.'
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
        <div className="col-md-6 mx-auto">
          <h2 className="text-center mb-4">Đăng nhập</h2>
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

            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <div className="d-flex justify-content-between mt-3">
              <Link to="/forgot-password" className="text-decoration-none">
                Quên mật khẩu?
              </Link>
              <Link to="/register" className="text-decoration-none">
                Đăng ký tài khoản mới
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Login;