import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Header from "./Header";

const PatientExamination = () => {
  const { user } = useAuth();
  const [examinations, setExaminations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchExaminations = async () => {
      try {
        const examinationResponse = await axios.get(
          `http://127.0.0.1:8000/api/examination/`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );

        const doctorResponse = await axios.get(
          "http://127.0.0.1:8000/api/doctors/",
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );

        const examinationsData = examinationResponse.data;

        const enrichedExaminations = await Promise.all(
          examinationsData.map(async (exam) => {
            const appointmentData = exam.appointment
              ? await axios
                  .get(`http://127.0.0.1:8000/api/appointments/${exam.appointment}/`)
                  .then((res) => res.data)
              : null;

            const servicesData = exam.services.length
              ? await Promise.all(
                  exam.services.map((serviceId) =>
                    axios
                      .get(`http://127.0.0.1:8000/api/services/${serviceId}/`)
                      .then((res) => res.data)
                  )
                )
              : [];

            const paymentData = exam.payment
              ? await axios
                  .get(`http://127.0.0.1:8000/api/payments/${exam.payment}/`)
                  .then((res) => res.data)
              : null;

            return {
              ...exam,
              appointment: appointmentData,
              services: servicesData,
              payment: paymentData,
            };
          })
        );

        setExaminations(enrichedExaminations);
        setDoctors(doctorResponse.data);
      } catch (err) {
        setError("Không thể tải lịch sử khám bệnh.");
      } finally {
        setLoading(false);
      }
    };

    fetchExaminations();
  }, []);

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? `${doctor.user.last_name} ${doctor.user.first_name}` : "Không xác định";
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'completed':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Header />
      <div className="mt-4 mx-5">
      <h2 className="text-center mb-4">Lịch sử khám bệnh</h2>
      {examinations.length === 0 ? (
          <Alert variant="info">Bạn chưa có lịch sử khám bệnh nào.</Alert>
      ) : (
          <Table striped bordered hover>
          <thead>
              <tr className="text-center align-middle">
                <th>Ca khám</th>
                <th>Ngày khám</th>
                <th>Bác sĩ</th>
                <th>Dịch vụ sử dụng</th>
                <th>Tổng số tiền</th>
                <th>Quá trình bệnh lý</th>
                <th>Tiền sử cá nhân</th>
                <th>Tiền sử gia đình</th>
                <th>Triệu chứng</th>
                <th>Kết quả xét nghiệm</th>
                <th>Chẩn đoán</th>
                <th>Kết quả</th>
                <th>Trạng thái thanh toán</th>
              </tr>
          </thead>
          <tbody className="align-middle">
              {examinations.map((exam) => (
              <tr key={exam.id}>
                <td className="text-center">
                  {`${exam.appointment.time_slot}`}
                </td>
                <td className="text-center">
                  {exam.appointment.date ? new Date(exam.appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                </td>
                <td className="text-center">{`${getDoctorName(exam.appointment.doctor)}`}</td>
                <td>
                  {exam.services.length > 0
                    ? exam.services.map((service) => (
                        <div key={service.id}>
                          {service.name} ({service.price} VND)
                        </div>
                      ))
                    : "Không có dịch vụ"}
                </td>
                <td className="text-center">{`${exam.payment.amount} VND`}</td>
                <td>{exam.pathological_process}</td>
                <td>{exam.personal_history}</td>
                <td>{exam.family_history}</td>
                <td>{exam.symptoms}</td>
                <td className="text-center">
                  {exam.paraclinical_results ? (
                    <a
                      href={exam.paraclinical_results}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                    >
                      <i className="bi bi-eye"></i>
                    </a>
                  ) : (
                    "Không có"
                  )}
                </td>
                <td>{exam.diagnosis}</td>
                <td>{exam.results}</td>
                <td className="text-center">
                  <span
                    className={`badge ${
                      exam.payment.status === "completed"
                        ? "bg-success"
                        : exam.payment.status === "pending"
                        ? "bg-warning"
                        : "bg-warning"
                    }`}
                    >
                    {getStatusText(exam.payment.status)}
                    </span>
                  </td>
              </tr>
              ))}
          </tbody>
          </Table>
      )}
      </div>
    </>
  );
};

export default PatientExamination;
