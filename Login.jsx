import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch {
      setError("Server not reachable");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Login</h1>

        {error && <p className="error">{error}</p>}

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button className="primary-btn" onClick={handleLogin}>
          Login
        </button>

        {/* Signup Button */}
        <Link to="/signup" className="secondary-btn">
          Signup
        </Link>
      </div>
    </div>
  );
}

export default Login;
