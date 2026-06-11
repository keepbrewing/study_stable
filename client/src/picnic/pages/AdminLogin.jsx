import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import "../styles/variables.css";
import "../styles/global.css";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            window.location.href = "/admin";
        }
    }, []);

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
                username,
                password
            });
            localStorage.setItem("token", res.data.token);
            navigate("/admin");
        } catch (err) {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-card">
                <h2 className="admin-login-title">Admin Login</h2>
                <div className="admin-login-form">
                    <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <button className="btn btn-primary" onClick={handleLogin}>Login</button>
                </div>
            </div>
        </div>
    );
}