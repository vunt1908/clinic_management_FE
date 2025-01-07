import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button } from "react-bootstrap";
import Header from "./Header";
import Swal from 'sweetalert2'

const StaffExamination = () => {
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
            try {
              if (!exam.payment) {
                return null;
              }

              const [appointment, services, payment] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/appointments/${exam.appointment}/`),
                Promise.all(
                  exam.services.map((serviceId) =>
                    axios.get(`http://127.0.0.1:8000/api/services/${serviceId}/`)
                  )
                ),
                axios.get(`http://127.0.0.1:8000/api/payments/${exam.payment}/`),
              ]);

              const patientResponse = await axios.get(
                `http://127.0.0.1:8000/api/patients/${appointment.data.patient}/`
              );

              return {
                ...exam,
                appointment: appointment.data,
                patient: patientResponse.data,
                services: services.map((service) => service.data),
                payment: payment.data,
              };
            } catch (fetchError) {
              console.error(`Error processing exam ID ${exam.id}:`, fetchError);
              return null;
            }
          })
        );

        setExaminations(enrichedExaminations.filter((exam) => exam !== null));
      } catch (err) {
        console.error(err);
        setError("Không thể tải lịch sử khám bệnh.");
      } finally {
        setLoading(false);
      }
    };

    fetchExaminations();
  }, []);

  const updatePaymentStatus = async (examId, newStatus, appointmentId) => {
    const result = await Swal.fire({
      title: "Xác nhận thay đổi",
      text: `Bạn có chắc chắn muốn cập nhật trạng thái thanh toán thành "${newStatus === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `http://127.0.0.1:8000/api/examination/${examId}/update_payment_status/`,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );

        if (newStatus === "completed") {
          await axios.patch(
            `http://127.0.0.1:8000/api/appointments/${appointmentId}/update_status/`,
            { status: "completed" },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            }
          );
        }

        if (newStatus === "pending") {
          await axios.patch(
            `http://127.0.0.1:8000/api/appointments/${appointmentId}/update_status/`,
            { status: "paraclinical_results_available" },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            }
          );
        }

        setExaminations((prev) =>
          prev.map((exam) =>
            exam.id === examId 
              ? { 
                  ...exam, 
                  payment: { ...exam.payment, status: newStatus },
                  appointment: { ...exam.appointment, status: newStatus === "completed" ? "paraclinical_results_available" : exam.appointment.status },
              } : exam
          )
        );

        Swal.fire("Thành công!", "Trạng thái đã được cập nhật.", "success");
      } catch (error) {
        Swal.fire("Thất bại!", "Có lỗi xảy ra khi cập nhật trạng thái.", "error");
      }
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chưa thanh toán";
      case "completed":
        return "Đã thanh toán";
      default:
        return "Không xác định";
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Header />
      <div className="mt-4 mx-5">
        <h2 className="text-center mb-4">Danh sách thanh toán</h2>
        <Table striped bordered hover className="text-center align-middle">
          <thead>
            <tr>
              <th>Họ và tên người bệnh</th>
              <th className="text-center">Ca khám</th>
              <th className="text-center">Ngày khám</th>
              <th className="text-center">Dịch vụ sử dụng</th>
              <th className="text-center">Tổng số tiền</th>
              <th className="text-center">Trạng thái thanh toán</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {examinations.map((exam) => (
              <tr key={exam.id}>
                <td>
                  {exam.patient.user.last_name} {exam.patient.user.first_name}
                </td>
                <td className="text-center">
                  {exam.appointment.time_slot}
                </td>
                <td className="text-center">
                      {exam.appointment.date ? new Date(exam.appointment.date).toLocaleDateString('en-GB') : "Đang tải..."}
                    </td>
                <td>
                  {exam.services.map((service) => (
                    <div key={service.id}>{service.name}</div>
                  ))}
                </td>
                <td className="text-center">{exam.payment.amount} VND</td>
                <td className="text-center">{getPaymentStatusLabel(exam.payment.status)}</td>
                <td className="text-center">
                  {exam.payment.status === "pending" && (
                    <Button
                      variant="success"
                      onClick={() => updatePaymentStatus(exam.id, "completed", exam.appointment.id)}
                    >
                      Thanh toán
                    </Button>
                  )}
                  {exam.payment.status === "completed" && (
                    <Button
                      variant="warning"
                      onClick={() => updatePaymentStatus(exam.id, "pending", exam.appointment.id)}
                    >
                      Chờ thanh toán
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default StaffExamination;
