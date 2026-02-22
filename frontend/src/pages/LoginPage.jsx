import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';

const LoginPage = ({ setAuthUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return alert("Please fill in all fields");

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8000/api/login", { 
                email: email.toLowerCase(), 
                password 
            });
            localStorage.setItem("user", JSON.stringify(res.data));
            setAuthUser(res.data);
            navigate('/explore');
        } catch (err) {
            alert(err.response?.data?.detail || "Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* ⬅️ Back to Landing Page */}
            <button className="back-btn" onClick={() => navigate('/')}>
                <FaArrowLeft />
            </button>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>ASTU NAV</h1>
                    <p>SECURE PORTAL ACCESS</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input 
                            type="email" 
                            placeholder="EMAIL ADDRESS" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="PASSWORD" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "AUTHORIZING..." : "AUTHORIZE ACCESS"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? 
                    <span onClick={() => navigate('/register')}> Register Now</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;