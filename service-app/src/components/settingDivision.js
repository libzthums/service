import React, { useState, useEffect, useContext, useCallback } from "react";
import { Tabs, Tab, Row, Col, Form, Button, Table } from "react-bootstrap";
import axios from "axios";
import { UrlContext } from "../router/route";
import { useNavigate } from "react-router-dom";

export default function SettingDivision() {
  const [userList, setUserList] = useState([]);
  const [divisionList, setDivisionList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [activeTab, setActiveTab] = useState("user");
  const { url } = useContext(UrlContext);
  const navigate = useNavigate();

  // Fetch users and divisions, and return fetched users
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(url + "userManage");
      const { users, divisions } = response.data;
      setUserList(users);
      setDivisionList(divisions);
      return users;
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to fetch user data. Please try again later.");
      return [];
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setActiveTab("division");
  };

  const handleSave = async () => {
    if (!selectedUser || !selectedDivision) {
      alert("Please select a user and a division.");
      return;
    }

    try {
      await axios.post(url + "userManage/addDivision", {
        userID: selectedUser.userID,
        divisionID: selectedDivision,
      });

      alert("Division added to user successfully!");
      setSelectedDivision("");

      // Refresh data and update selected user from the new list
      const updatedUsers = await fetchData();
      const updatedUser = updatedUsers.find(u => u.userID === selectedUser.userID);
      setSelectedUser(updatedUser);

      setActiveTab("division");
    } catch (error) {
      console.error("Error adding division to user:", error);
      alert("Failed to add division to user. Please try again.");
    }
  };

  return (
    <div className="p-4 container">
      <Row className="align-items-center mt-4 mb-4">
        <Col xs="auto">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back
          </Button>
        </Col>
        <Col>
          <h2>User Division</h2>
        </Col>
      </Row>

      <div className="d-flex flex-column align-items-center mb-4">
        <Form className="w-100" style={{ maxWidth: "600px" }}>
          <Form.Group
            as={Row}
            className="mb-3 justify-content-center"
            controlId="formUsername">
            <Form.Label column sm={3} className="fw-bold text-end">
              Username:
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                value={selectedUser?.Name || ""}
                readOnly
              />
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-3 justify-content-center"
            controlId="formDivision">
            <Form.Label column sm={3} className="fw-bold text-end">
              Division:
            </Form.Label>
            <Col sm={9}>
              <Form.Select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                style={{ textAlign: "center" }}>
                <option value="">---- Please select division ----</option>
                {divisionList.map((division) => (
                  <option key={division.divisionID} value={division.divisionID}>
                    {division.divisionName}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          <Row className="justify-content-center">
            <Col sm={12} className="text-center">
              <Button variant="success" onClick={handleSave}>
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3">
        <Tab eventKey="division" title="Division">
          <h5 className="fw-bold mb-3">Division List</h5>
          {selectedUser ? (
            <Table bordered>
              <thead>
                <tr>
                  <th>Division</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.divisions.map((division, idx) => (
                  <tr key={idx}>
                    <td>{division.divisionName}</td>
                    <td>{idx === 0 ? selectedUser.Name : ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">
              Please select a user from the "User" tab.
            </p>
          )}
        </Tab>

        <Tab eventKey="user" title="User">
          <h5 className="fw-bold mb-3">User List</h5>
          {userList.length === 0 ? (
            <p className="text-muted">No users available.</p>
          ) : (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Division</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => (
                  <tr
                    key={index}
                    onClick={() => handleUserClick(user)}
                    style={{ cursor: "pointer" }}>
                    <td>{user.Name}</td>
                    <td>{user.divisions[0]?.divisionName || "No Division"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
