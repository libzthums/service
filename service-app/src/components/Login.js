import { useUser } from "../context/userContext";
import axios from "axios";
import { useState, useContext } from "react";
import { UrlContext } from "../router/route";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { url } = useContext(UrlContext);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(url + "login", {
        userName,
        userPassword,
      });

      // Save the JWT token and user data to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Save user data

      setUser(res.data.user); // Store user info globally in context
      navigate("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ width: "300px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <div className="form-group">
          <input
            type="email"
            className="form-control mb-3"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            autoComplete="false"
          />
          <input
            type="password"
            className="form-control mb-3"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Password"
            autoComplete="false"
          />
          <button onClick={handleLogin} className="btn btn-primary w-100">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
