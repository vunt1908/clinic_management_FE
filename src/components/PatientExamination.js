import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Container } from "react-bootstrap";
import { useAuth } from "../components/AuthContext";
import Header from "./Header";

const PatientExamination = () => {
  const { user } = useAuth();
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        const examinationResponse = await axios.get(
          `http://127.0.0.1:8000/api/examination/`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );

        const examinationsData = examinationResponse.data;

        const enrichedExaminations = await Promise.all(
          examinationsData.map(async (exam) => {
            const [appointment, services, payment, medicalRecord] = await Promise.all([
              axios.get(`http://127.0.0.1:8000/api/appointments/${exam.appointment}/`),
              Promise.all(
                exam.services.map((serviceId) =>
                  axios.get(`http://127.0.0.1:8000/api/services/${serviceId}/`)
                )
              ),
              axios.get(`http://127.0.0.1:8000/api/payments/${exam.payment}/`),
              axios.get(`http://127.0.0.1:8000/api/medical-records/${exam.medical_record}/`),
            ]);

            return {
              ...exam,
              appointment: appointment.data,
              services: services.map((service) => service.data),
              payment: payment.data,
              medicalRecord: medicalRecord.data,
            };
          })
        );

        setExaminations(enrichedExaminations);
      } catch (err) {
        setError("Không thể tải lịch sử khám bệnh.");
      } finally {
        setLoading(false);
      }
    };

    fetchExaminations();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
        <Header />
        <Container className="mt-5">
        <h2 className="text-center mb-4">Lịch sử khám bệnh</h2>
        {examinations.length === 0 ? (
            <Alert variant="info">Bạn chưa có lịch sử khám bệnh nào.</Alert>
        ) : (
            <Table striped bordered hover>
            <thead>
                <tr>
                <th>Thời gian khám</th>
                <th>Dịch vụ sử dụng</th>
                <th>Tổng số tiền</th>
                <th>Triệu chứng</th>
                <th>Chẩn đoán</th>
                <th>Kết quả</th>
                <th>Trạng thái thanh toán</th>
                </tr>
            </thead>
            <tbody>
                {examinations.map((exam) => (
                <tr key={exam.id}>
                    <td>
                    {exam.appointment.date} {exam.appointment.time_slot}
                    </td>
                    <td>
                    {exam.services.map((service) => (
                        <div key={service.id}>
                        {service.name} ({service.price} VND)
                        </div>
                    ))}
                    </td>
                    <td>{exam.payment.amount} VND</td>
                    <td>{exam.medicalRecord.symptoms}</td>
                    <td>{exam.medicalRecord.diagnosis}</td>
                    <td>{exam.medicalRecord.results}</td>
                    <td>{exam.payment.status}</td>
                </tr>
                ))}
            </tbody>
            </Table>
        )}
        </Container>
    </>
  );
};

export default PatientExamination;
