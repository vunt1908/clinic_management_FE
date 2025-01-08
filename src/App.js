import React from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Department from './components/Department';
import Register from './components/Auth/Register';
import Doctor from './components/Doctor';
import Appointment from './components/Appointment';
import Admin from './components/Admin';
import ManageDepartment from './components/ManageDepartment';
import AppointmentHistory from './components/AppointmentHistory';
import DoctorAppointments from './components/DoctorAppointment';
import ManageDoctor from './components/ManageDoctor';
import ManagePatient from './components/ManagePatient';
import ManageAppointment from './components/ManageAppointment';
import ManageStaff from './components/ManageStaff';
import Reception from './components/Reception';
import ManageService from './components/ManageService';
import Payment from './components/Payment';
import ListAppointmentStaff from './components/ListAppointmentStaff';
import StaffAppointment from './components/StaffAppointment';
import PatientExamination from './components/PatientExamination';
import DoctorExamination from './components/DoctorExamination';
import StaffExamination from './components/StaffExamination';
import DoctorProfile from './components/DoctorProfile';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import ManageNurse from './components/ManageNurse';
import ParaclinicalRresults from './components/ParaclinicalResults';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={ <Register/> } />
          <Route path="/departments" element={<Department />} />
          <Route path="/doctors" element={< Doctor />} />
          <Route path='/appointments' element={<Appointment/>} />
          <Route path="/appointments/history" element={<AppointmentHistory />} />
          <Route path="/appointments/doctor" element={<DoctorAppointments />} />
          <Route path='/appointments/staff' element={<ListAppointmentStaff />} />
          <Route path='/appointments/staff/booking' element={<StaffAppointment />} />
          <Route path='/paraclinicalresults' element={<ParaclinicalRresults />} />
          <Route path='/patient-examination' element={<PatientExamination />} />
          <Route path='/doctor-examination' element={<DoctorExamination />} />
          <Route path='/staff-examination' element={<StaffExamination />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/profile' element={<PatientProfile />} />
          <Route path='receptions' element={<Reception />} />
          <Route path='payment' element={<Payment />} />
          <Route path="/admin" element={<Admin />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="manage-departments" element={<ManageDepartment />} />
            <Route path="manage-doctors" element={<ManageDoctor />} />
            <Route path="manage-patients" element={<ManagePatient />} />
            <Route path='manage-appointments' element={ <ManageAppointment />} />
            <Route path='manage-staffs' element={ <ManageStaff /> } />
            <Route path='manage-nurses' element={ <ManageNurse /> } />
            <Route path='manage-services' element={ <ManageService /> } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;