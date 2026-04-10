import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";
import "../styles/variables.css";
import "../styles/global.css";

export default function Admin() {
    const [data, setData] = useState([]);
    const [expanded, setExpanded] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            window.location.href = "/admin-login";
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/participants`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setData(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/admin-login";
            } else {
                alert("Unauthorized");
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/participant/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setData(data.filter(item => item._id !== id));
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/admin-login";
            } else {
                alert("Delete Failed");
            }
        }
    };

    const handleDownload = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/download`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: "blob"
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "participants.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/admin-login";
    }

    return (
        <div className="admin-wrapper">
            <div className="admin-container">
                <div className="admin-header">
                    <h2 className="admin-title">Admin Panel</h2>
                    <div className="admin-actions">
                        <button className="btn-primary" onClick={handleDownload}>Download CSV</button>
                        <button className="btn-ghost" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <div className="table-container">
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>ID</th>
                                <th>Gender</th>
                                <th>Friend Name</th>
                                <th>Avatar</th>
                                <th>Action</th>
                                <th>Expand</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((p) => (
                                <>
                                    {/* MAIN ROW */}
                                    <tr key={p._id}>
                                        <td>{p.name}</td>
                                        <td>{p.participantId}</td>
                                        <td>{p.gender}</td>
                                        <td>{p.friend?.name || "-"}</td>
                                        <td>{p.friend?.avatar || "-"}</td>

                                        <td>
                                            <button
                                                onClick={() =>
                                                    setExpanded(expanded === p._id ? null : p._id)
                                                }
                                            >
                                                {expanded === p._id ? "Hide" : "Expand"}
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(p._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>

                                    {/* EXPANDED ROW */}
                                    {expanded === p._id && (
                                        <tr>
                                            <td colSpan="7">
                                                <div style={{ textAlign: "left" }}>

                                                    {/* PD */}
                                                    <strong>PD Responses:</strong>

                                                    {p.responses
                                                        ?.filter(r => r.stage === "pd")
                                                        .map((r, i) => (
                                                            <div key={i}>
                                                                Step {r.step} | {r.eventType} | {r.value || "-"} | {r.correct ? "Correct" : "Wrong"} | {r.responseTimeMs}ms
                                                            </div>
                                                        ))}

                                                    {/* AFFECT */}
                                                    <div style={{ marginTop: "12px" }}>
                                                        <strong>Affect Responses:</strong>

                                                        {p.responses
                                                            ?.filter(r => r.stage === "affect")
                                                            .map((r, i) => (
                                                                <div key={i}>
                                                                    {r.subStage} | {r.type} | {r.value || "-"} |
                                                                    {r.correct !== undefined ? (r.correct ? "Correct" : "Wrong") : "-"} |
                                                                    Attempt: {r.attempt ?? "-"} |
                                                                    Time: {r.responseTimeMs ?? "-"}ms |
                                                                    {r.transcript || "-"}
                                                                </div>
                                                            ))}
                                                    </div>

                                                    <div style={{ marginTop: "12px" }}>
                                                        <strong>Task Responses:</strong>

                                                        {p.responses
                                                            ?.filter(r => r.stage === "task")
                                                            .map((r, i) => (
                                                                <div key={i}>
                                                                    {r.subStage} | {r.type} | {r.transcript || "-"}
                                                                </div>
                                                            ))}
                                                    </div>

                                                    <div style={{ marginTop: "12px" }}>
                                                        <strong>GoNoGo Responses:</strong>

                                                        {p.responses
                                                            ?.filter(r => r.stage === "gonogo")
                                                            .map((r, i) => (
                                                                <div key={i}>
                                                                    {r.category} | {r.value}
                                                                </div>
                                                            ))}
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}