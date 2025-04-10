import React from "react";
import { Dropdown } from "react-bootstrap";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage and reset user context
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Reset user in context

    // Navigate to login page
    navigate("/login");
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-dark bg-blue">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <button className="nav-link" data-widget="pushmenu" type="button">
            <i className="fa fa-bars"></i>
          </button>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto d-flex align-items-center">
        {/* Username Display */}
        <li className="nav-item mr-3">
          <h5 className="mb-0">{user?.userName}</h5>
        </li>

        {/* Dropdown menu for Logout */}
        <li className="nav-item dropdown">
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="nav-link"
              id="userDropdown">
              <i className="fa fa-cogs"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ul>
    </nav>
  );
}
