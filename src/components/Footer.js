import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import logo from "../assets/logo.png"

const Footer = () => {
    return (
        <footer className="bg-light text-dark pt-5 pb-4">
            <div className="container text-center text-md-left">
                <div className="row text-center text-md-left">
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">
                            <img src={logo} alt="Clinic logo" style={{height: '30px'}}/> Clinic
                        </h5>
                        <p>Nguyen Van Loc, Mo Lao, Ha Dong, Hanoi</p>
                        <p>+01234567890</p>
                        <p>Clinic@gmail.com</p>
                    </div>

                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Quick Links</h5>
                        <p><a href="/" className="text-dark text-decoration-none">Home</a></p>
                        <p><a href="/about" className="text-dark text-decoration-none">About</a></p>
                        <p><a href="/doctors" className="text-dark text-decoration-none">Doctors</a></p>
                        <p><a href="/appointments" className="text-dark text-decoration-none">Appointments</a></p>
                    </div>

                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Departments</h5>
                        <p><a href="/department1" className="text-dark text-decoration-none">Department 1</a></p>
                        <p><a href="/department2" className="text-dark text-decoration-none">Department 2</a></p>
                        <p><a href="/department3" className="text-dark text-decoration-none">Department 3</a></p>
                        <p><a href="/department4" className="text-dark text-decoration-none">Department 4</a></p>
                    </div>

                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">More about us</h5>
                        <div>
                        <a href="https://facebook.com" className="text-dark me-4"><FaFacebookF /></a>
                        <a href="https://instagram.com" className="text-dark me-4"><FaInstagram /></a>
                        <a href="https://linkedin.com" className="text-dark"><FaLinkedinIn /></a>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;