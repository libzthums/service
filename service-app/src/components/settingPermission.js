import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Form, Button, Table } from "react-bootstrap";
import axios from "axios";
import { UrlContext } from "../router/route";
import { useNavigate } from "react-router-dom";

const useUserData = (url) => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(url + "userManage");
        setUserList(response.data.users || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsers();
  }, [url]);

  return { userList, setUserList };
};

export default function SettingPermission() {
  const { url } = useContext(UrlContext);
  const { userList, setUserList } = useUserData(url);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState("");
  const navigate = useNavigate();

  // Map numeric permissions to roles
  const permissionMap = {
    1: "Viewer",
    2: "Admin",
    3: "Manager",
  };

  // Reverse map for saving permissions
  const reversePermissionMap = {
    Viewer: 1,
    Admin: 2,
    Manager: 3,
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedPermission(permissionMap[user.Permission]); // Pre-fill the permission dropdown
  };

  const handleSave = async () => {
    if (!selectedUser || !selectedPermission) {
      alert("Please select a user and a permission.");
      return;
    }

    try {
      await axios.post(url + "userManage/updatePermission", {
        userID: selectedUser.userID,
        permission: reversePermissionMap[selectedPermission], // Save numeric value
      });

      alert("Permission updated successfully!");
      setSelectedUser(null);
      setSelectedPermission("");

      // Refresh user list
      const response = await axios.get(url + "userManage");
      setUserList(response.data.users);
    } catch (error) {
      console.error("Error updating permission:", error);
      alert("Failed to update permission. Please try again.");
    }
  };

  return (
    <div className="p-4 main-container responsive-layout">
      <div className="row align-items-center mt-4 mb-4">
        <div className="col-auto">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back
          </Button>
        </div>
        <div className="col">
          <h2>Manual Upload</h2>
        </div>
      </div>

      {/* Form Section */}
      <div className="d-flex flex-column align-items-center mb-4">
        <Form className="w-100" style={{ maxWidth: "600px" }}>
          {/* Username Field */}
          <Form.Group
            as={Row}
            className="mb-3 justify-content-center"
            controlId="formUsername"
          >
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

          {/* Permission Dropdown */}
          <Form.Group
            as={Row}
            className="mb-3 justify-content-center"
            controlId="formPermission"
          >
            <Form.Label column sm={3} className="fw-bold text-end">
              Permission:
            </Form.Label>
            <Col sm={9}>
              <Form.Select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                style={{ textAlign: "center" }}
              >
                <option value="">---- Please select permission ----</option>
                {Object.values(permissionMap).map((permission) => (
                  <option key={permission} value={permission}>
                    {permission}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          <Row className="justify-content-center">
            <Col sm={12} className="text-center">
              <Button
                variant="success"
                onClick={handleSave}
                disabled={!selectedUser}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* User List */}
      <h5 className="fw-bold mb-3">User List</h5>
      {userList && userList.length === 0 ? (
        <p className="text-muted">No users available.</p>
      ) : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>Username</th>
              <th>Permission</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <tr
                key={user.userID}
                onClick={() => handleUserClick(user)}
                style={{ cursor: "pointer" }}
              >
                <td>{user.Name}</td>
                <td>{permissionMap[user.Permission]}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
