import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      navigate("/");
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Signup</h1>

        {error && <p style={{ color: "#ffb4b4" }}>{error}</p>}

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSignup}>Signup</button>

        <div className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
