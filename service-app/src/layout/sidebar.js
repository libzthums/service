import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { useUser } from "../context/userContext";

export default function Sidebar() {
  const [isReissueOpen, setReissueOpen] = useState(false);
  const [isTotalOpen, setTotalOpen] = useState(false);
  const { user, activeDivision, setActiveDivision } = useUser();

  const handleDivisionChange = (e) => {
    const newID = parseInt(e.target.value);
    const index = user.divisionIDs.indexOf(newID);
    setActiveDivision({
      id: newID,
      name: user.divisionNames[index],
    });
    localStorage.setItem("activeDivisionID", newID); // persist selected division
  };

  return (
    <aside className="main-sidebar sidebar-light-primary elevation-4">
      <a href="/" className="custom-brand-link text-center bg-primary">
        <span className="brand-text text-brand">Service Charge</span>
      </a>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column">
            {/* User Info */}
            <li className="nav-header">User</li>
            <li className="nav-header">
              <span className="nav-link">
                <strong>{user?.name}</strong>
              </span>
              <span className="nav-link">{user?.permission}</span>
            </li>

            {/* Current Division Info */}
            {/* <li className="nav-item px-2">
              <strong className="text-muted small">Division: {activeDivision?.name}</strong>
            </li> */}

            {/* Division Switcher */}
            <li className="nav-item px-2 mb-2 mt-2 mr-4">
              <Form.Select
                value={activeDivision?.id || ""}
                onChange={handleDivisionChange}
                className="form-control">
                {user?.divisionIDs?.map((id, idx) => (
                  <option key={id} value={id}>
                    {user.divisionNames?.[idx] || `Division ${id}`}
                  </option>
                ))}
              </Form.Select>
            </li>

            {/* Dashboard */}
            <NavItem to="/" icon="fas fa-home" label="Dashboard" />

            {/* Upload */}
            <NavItem to="/uploadPage" icon="fa fa-file" label="Upload" />

            {/* Reissue Dropdown */}
            <li className={`nav-item ${isReissueOpen ? "menu-open" : ""}`}>
              <Button
                href="#"
                className="nav-link d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setReissueOpen(!isReissueOpen);
                }}>
                <span>
                  <i className="nav-icon fas fa-sync-alt"></i> Reissue
                </span>
                <i
                  className={`fas fa-angle-${
                    isReissueOpen ? "down" : "left"
                  }`}></i>
              </Button>

              <ul
                className={`nav nav-treeview ${
                  isReissueOpen ? "d-block" : "d-none"
                }`}>
                <NavItem
                  to="/reissuePage"
                  state={{ status: 1 }}
                  label="Issued"
                />
                <NavItem
                  to="/reissuePage"
                  state={{ status: 2 }}
                  label="Expire within 3 months"
                />
                <NavItem
                  to="/reissuePage"
                  state={{ status: 3 }}
                  label="Expired Issue"
                />
              </ul>
            </li>

            {/* Total Dropdown */}
            <li className={`nav-item ${isTotalOpen ? "menu-open" : ""}`}>
              <Button
                href="#"
                className="nav-link d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setTotalOpen(!isTotalOpen);
                }}>
                <span>
                  <i className="nav-icon fas fa-list"></i> Total
                </span>
                <i
                  className={`fas fa-angle-${
                    isTotalOpen ? "down" : "left"
                  }`}></i>
              </Button>

              <ul
                className={`nav nav-treeview ${
                  isTotalOpen ? "d-block" : "d-none"
                }`}>
                <NavItem
                  to="/totalPage"
                  state={{ status: 1 }}
                  label="Per Month"
                />
                <NavItem
                  to="/totalPage"
                  state={{ status: 2 }}
                  label="Per Year"
                />
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

const NavItem = ({ to, icon, label, state }) => (
  <li className="nav-item">
    <Link to={to} className="nav-link" state={state}>
      {icon && <i className={`nav-icon ${icon}`}></i>} <p>{label}</p>
    </Link>
  </li>
);
