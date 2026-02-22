import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // 📧 Strict Email Validation (Regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return alert("Please insert a correct, valid email address.");
        }

        try {
            const res = await axios.post("http://localhost:8000/api/register", formData);
            alert(res.data.message);
            navigate('/login');
        } catch (err) {
            // 🛑 Handles "Already Exists" error from Backend
            alert(err.response?.data?.detail || "Registration failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="icon-badge">🚀</div>
                    <h1>CREATE ACCOUNT</h1>
                    <p>JOIN THE ASTU SPATIAL NETWORK</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required 
                        />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button type="submit" className="register-btn">REGISTER NOW →</button>
                </form>

                <p className="auth-footer">
                    Already have an account? 
                    <span onClick={() => navigate('/login')}> Sign In</span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;