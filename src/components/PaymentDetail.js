import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const PaymentDetail = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchPayment = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/payments/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setPayment(response.data);
    } catch (error) {
      setMessage("Không thể tải thông tin thanh toán.");
    }
  };

  const handlePayment = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/payments/${id}/`,
        { payment_status: "completed" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      setMessage("Thanh toán thành công.");
      navigate("/payments");
    } catch (error) {
      setMessage("Có lỗi xảy ra khi thanh toán.");
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  if (!payment) return <p>Đang tải thông tin thanh toán...</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-center">Chi tiết thanh toán</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <div>
        <p>Bệnh nhân: {payment.patient_name}</p>
        <p>Số tiền: {payment.total_amount}</p>
        <p>Trạng thái: {payment.payment_status}</p>
      </div>
      {payment.payment_status === "pending" && (
        <button className="btn btn-success" onClick={handlePayment}>
          Xác nhận thanh toán
        </button>
      )}
      <button className="btn btn-secondary ml-3" onClick={() => navigate("/payments")}>
        Quay lại
      </button>
    </div>
  );
};

export default PaymentDetail;
