import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function Sidebar() {
  const [isReissueOpen, setReissueOpen] = useState(false);
  const [isTotalOpen, setTotalOpen] = useState(false);

  return (
    <aside className="main-sidebar sidebar-light-primary elevation-4">
      <a href="/" className="custom-brand-link text-center bg-primary">
        <span className="brand-text text-brand">Service Charge</span>
      </a>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column">
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
