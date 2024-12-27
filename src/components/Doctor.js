import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";
import Header from "./Header";

const Doctor = () => {
  const [doctors, setDoctors] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/doctors/");
        setDoctors(response.data); 
        setIsLoading(false); 
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu."); 
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <>
      <Header/>
      <Container className="mt-5">
        <h2 className="text-center mb-4">Danh sách bác sĩ</h2>

        {isLoading && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!isLoading && !error && (
          <Table striped bordered hover className="text-center">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên bác sĩ</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Chuyên môn</th>
                <th>Khoa</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor, index) => (
                <tr key={doctor.id}>
                  <td>{index + 1}</td>
                  <td>{`${doctor.user.last_name} ${doctor.user.first_name} `}</td>
                  <td>{doctor.user.email}</td>
                  <td>{doctor.user.phone}</td>
                  <td>{doctor.expertise || "Chưa cập nhật"}</td>
                  <td>{doctor.department_name || "Không xác định"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
    
  );
};

export default Doctor;
