import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Payment = () => {
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  const fetchPatients = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/reception/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendingPatients = response.data.filter((patient) => patient.status === "in_progress");
      setPatients(pendingPatients);
    } catch (error) {
      setMessage("Không thể tải danh sách bệnh nhân.");
    }
  }, [token]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/services/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
    } catch (error) {
      setMessage("Không thể tải danh sách dịch vụ.");
    }
  }, [token]);

  const fetchPayment = useCallback(async (patientId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/payments/?patient=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.length > 0) {
        setCurrentPatient(response.data[0]);
        setPaymentStatus(response.data[0].status);
        setTotalAmount(response.data[0].amount);
      }
    } catch (error) {
      setMessage("Không thể tải thông tin thanh toán.");
    }
  }, [token]);

  const handleAddService = async () => {
    if (!selectedService || !currentPatient) {
      setMessage("Vui lòng chọn dịch vụ trước khi tiếp tục.");
      return;
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/payments/${currentPatient.id}/add_service_to_payment/`,
        { service: selectedService },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Dịch vụ đã được thêm vào thanh toán.");
      fetchPayment(currentPatient.patient.id);
    } catch (error) {
      setMessage(error.response?.data?.error || "Có lỗi xảy ra khi thêm dịch vụ.");
    }
  };

  const handleCompletePayment = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/payments/${currentPatient.id}/complete_payment/`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentStatus("completed");
      setMessage("Thanh toán đã hoàn thành.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Có lỗi xảy ra khi hoàn thành thanh toán.");
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchServices();
  }, [fetchPatients, fetchServices]);

  return (
    <>
      <Header />
      <div className="container mt-4">
        <h2 className="text-center">Danh sách thanh toán</h2>
        {message && <div className="alert alert-info">{message}</div>}

        {patients.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên bệnh nhân</th>
                <th>Tổng chi phí</th>
                <th>Trạng thái thanh toán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.patient?.last_name} {patient.patient?.user?.first_name}</td>
                  <td>{totalAmount} VND</td>
                  <td>{paymentStatus}</td>
                  <td>
                    {paymentStatus === "pending" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleCompletePayment(patient.id)}
                      >
                        Thanh toán
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">Không có bệnh nhân nào cần thanh toán.</p>
        )}
      </div>
    </>
  );
};

export default Payment;
