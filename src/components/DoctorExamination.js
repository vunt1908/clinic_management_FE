import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Container, Form, Button } from "react-bootstrap";

const DoctorExamination = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/examination/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        const data = response.data;

        const enrichedExaminations = await Promise.all(
          data.map(async (exam) => {
            const [appointment, services, medicalRecord, patient] = await Promise.all([
              axios.get(`http://127.0.0.1:8000/api/appointments/${exam.appointment}/`),
              Promise.all(
                exam.services.map((serviceId) =>
                  axios.get(`http://127.0.0.1:8000/api/services/${serviceId}/`)
                )
              ),
              axios.get(`http://127.0.0.1:8000/api/medical-records/${exam.medical_record}/`),
              axios.get(`http://127.0.0.1:8000/api/patients/${exam.patient}/`),
            ]);

            return {
              ...exam,
              appointment: appointment.data,
              services: services.map((service) => service.data),
              medicalRecord: medicalRecord.data,
              patient: patient.data,
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

  const filteredExaminations = examinations.filter((exam) =>
    exam.patient.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Lịch sử khám bệnh - Bác sĩ</h2>
      <Form className="mb-3">
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Form.Group>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tên bệnh nhân</th>
            <th>Thời gian khám</th>
            <th>Dịch vụ sử dụng</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredExaminations.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.patient.name}</td>
              <td>
                {exam.appointment.date} {exam.appointment.time_slot}
              </td>
              <td>
                {exam.services.map((service) => (
                  <div key={service.id}>{service.name}</div>
                ))}
              </td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => alert(`Chi tiết lần khám ID: ${exam.id}`)}
                >
                  Xem chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DoctorExamination;
