import React from 'react';
import { FaHospital } from 'react-icons/fa';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <FaHospital className="text-primary" style={{ fontSize: '3rem' }} />
                  <h2 className="mt-3 mb-4">{title}</h2>
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;