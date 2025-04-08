import React from "react";
// import Spinner from "react-bootstrap/Spinner";
import { Dropdown } from "react-bootstrap";

export default function Header() {
  return (
    <nav className="main-header navbar navbar-expand navbar-dark bg-blue">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <button
            className="nav-link"
            data-widget="pushmenu"
            type="button">
            <i className="fa fa-bars"></i>
          </button>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        {/* <li className="nav-item">
          <button className="nav-link" href="#">
            <Spinner
              animation="grow"
              variant="light"
              size="sm"
              className="mr-2"
            />
            <i className="fa fa-user"></i>
            <span className="ml-2">Username</span>
          </button>
        </li> */}

        {/* Dropdown menu for userID and Logout */}
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
              <Dropdown.Item href="/logout">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ul>
    </nav>
  );
}
