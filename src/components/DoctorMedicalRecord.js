import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const DoctorMedicalRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận thông tin bệnh nhân và bác sĩ từ state khi điều hướng
  const { patient, doctor } = location.state || {};

  const [formData, setFormData] = useState({
    patient: patient?.id || "",
    doctor: doctor?.id || "",
    symptoms: "",
    diagnosis: "",
    results: "",
  });

  const [message, setMessage] = useState("");

  // Kiểm tra nếu không có thông tin bệnh nhân hoặc bác sĩ, quay lại trang chờ
  useEffect(() => {
    if (!patient || !doctor) {
      setMessage("Thông tin bệnh nhân và bác sĩ không hợp lệ.");
      navigate("/waiting");
    }
  }, [patient, doctor, navigate]);

  // Cập nhật giá trị khi thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gửi yêu cầu thêm bệnh án
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient || !formData.doctor) {
      setMessage("Bệnh nhân và bác sĩ không được để trống.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/medical-records/", {
        patient: patient.id, 
        doctor: doctor.id,  
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        results: formData.results,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setMessage("Thêm bệnh án thành công.");
      navigate("/medical-records"); // Điều hướng đến danh sách bệnh án sau khi thành công
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Có lỗi xảy ra khi thêm bệnh án. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Thêm mới bệnh án</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Bệnh nhân:</label>
          <input
            type="text"
            name="patient"
            className="form-control"
            value={`${patient?.user?.last_name || ""} ${patient?.user?.first_name || ""}`}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Bác sĩ:</label>
          <input
            type="text"
            name="doctor"
            className="form-control"
            value={`${doctor?.user?.last_name || ""} ${doctor?.user?.first_name || ""}`}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Triệu chứng:</label>
          <textarea
            name="symptoms"
            className="form-control"
            value={formData.symptoms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Chẩn đoán:</label>
          <textarea
            name="diagnosis"
            className="form-control"
            value={formData.diagnosis}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Kết quả:</label>
          <textarea
            name="results"
            className="form-control"
            value={formData.results}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Lưu bệnh án
        </button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ml-3"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </form>
    </div>
  );
};

export default DoctorMedicalRecord;
