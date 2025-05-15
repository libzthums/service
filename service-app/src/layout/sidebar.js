/**
 * The Sidebar component in this React application displays navigation links based on user permissions
 * and allows users to switch between different divisions.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { useUser } from "../context/userContext";

export default function Sidebar() {
  const [isReissueOpen, setReissueOpen] = useState(false);
  const [isTotalOpen, setTotalOpen] = useState(false);
  const { user, activeDivision, setActiveDivision } = useUser();

/* The `useEffect` hook in the provided code snippet is responsible for setting the active division
when the component mounts or when the `user` or `activeDivision` state changes. */
  useEffect(() => {
    if (user?.divisionIDs?.length > 0 && !activeDivision) {
      const defaultID = user.divisionIDs[0];
      setActiveDivision({
        id: defaultID,
        name: user.divisionNames[0],
      });
      localStorage.setItem("activeDivisionID", defaultID); // Persist the default division
    }
  }, [user, activeDivision, setActiveDivision]);

/**
 * The function `handleDivisionChange` updates the active division based on the selected division ID
 * and persists the selection in local storage.
 * @param e - The parameter `e` in the `handleDivisionChange` function is typically an event object
 * that represents the event being handled, such as a change event on an input element. In this case,
 * it is used to extract the new value selected by the user from the event target.
 */
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
      <Link
        to="/"
        className="brand-link text-center bg-primary"
        style={{
          textDecoration: "none",
          display: "block",
          fontWeight: "bold",
        }}>
        <span className="brand-text text-brand">Service Charge</span>
      </Link>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column">
            {user && (
              <li className="nav-item">
                <div
                  className="text-center mt-4"
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    borderRadius: "20px",
                  }}>
                  {user?.name}
                </div>
                {user?.permission !== "Admin" && user?.permission !== "Manager" && (
                  <Form.Select
                    value={activeDivision?.id}
                    onChange={handleDivisionChange}
                    className="form-control mt-1 mb-1 text-center"
                    id="divisionSelect"
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      borderRadius: "20px",
                    }}>
                    {user?.divisionIDs?.map((id, idx) => (
                      <option key={id} value={id}>
                        {user.divisionNames?.[idx] || `Division ${id}`}
                      </option>
                    ))}
                  </Form.Select>
                )}
                {user?.permission !== "Viewer" && (
                  <div
                    className="text-center mt-1"
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      borderRadius: "20px",
                    }}>
                    {user?.permission}
                  </div>
                )}
                <div className="border-bottom p-3 border-2 border-secondary"></div>
              </li>
            )}
            <div style={{ marginTop: "35px" }}></div>
            <NavItem to="/" icon="fas fa-home" label="Dashboard" />
            <NavItem to="/uploadPage" icon="fa fa-file" label="Upload" />
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
                <NavItem to="/reissuePage" state={{ status: 1 }}>
                  <span style={{ marginLeft: "34.5px" }}>Issued</span>
                </NavItem>
                <NavItem to="/reissuePage" state={{ status: 2 }}>
                  <span style={{ marginLeft: "34.5px" }}>Expired Issue</span>
                </NavItem>
              </ul>
            </li>
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
                <NavItem to="/totalPage" label="">
                  <span style={{ marginLeft: "34.5px" }}>Per year</span>
                </NavItem>
                <NavItem to="/summaryPage" label="">
                  <span style={{ marginLeft: "34.5px" }}>Summary</span>
                </NavItem>
              </ul>
            </li>
            {/* <NavItem to="/summaryPage" icon="fa fa-chart-pie" label="Summary" /> */}
            {user?.permission === `Admin` && (
              <NavItem to="/setting" icon="fa fa-cog" label="Setting" />
            )}
            <div>
              <br></br>
            </div>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

const NavItem = ({ to, icon, label, state, children }) => (
  <li className="nav-item">
    <Link to={to} className="nav-link" state={state}>
      {icon && <i className={`nav-icon ${icon}`}></i>}
      {label && <p>{label}</p>}
      {children}
    </Link>
  </li>
);
