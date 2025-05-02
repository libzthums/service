import React, { useState, useEffect, useContext } from "react";
import { Button, Row, Col, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UrlContext } from "../router/route";

export default function SettingType() {
  const navigate = useNavigate();
  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeList, setTypeList] = useState([]);
  const { url } = useContext(UrlContext);

  // Fetch type list from the backend
  useEffect(() => {
    const fetchTypeList = async () => {
      try {
        const response = await axios.get(url + "service/typelist");
        setTypeList(response.data || []); // Ensure response.data is an array
      } catch (err) {
        console.error("Error fetching type list:", err);
        setError("Failed to load type list. Please try again.");
        setTypeList([]); // Fallback to an empty array on error
      }
    };

    fetchTypeList();
  }, [url]);

  const handleAddType = async () => {
    if (!typeName.trim()) {
      setError("Type Name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(url + "service/addtype", {
        typeName,
      });

      const newType = { id: response.data.id, TypeName: typeName };
      setTypeList([...typeList, newType]);

      alert("Type added successfully!");
      setTypeName(""); // Clear input field
    } catch (err) {
      console.error("Error adding type:", err);
      setError("Failed to add type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4">
      <Row className="align-items-center mb-4 mt-4">
        <Col xs="auto">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back
          </Button>
        </Col>
        <Col>
          <h2>Add Type</h2>
        </Col>
      </Row>

      <div className="d-flex flex-column align-items-center mb-4">
        <Form className="w-100" style={{ maxWidth: "600px" }}>
          <Form.Group
            as={Row}
            className="mb-3 justify-content-center"
            controlId="formTypeName">
            <Form.Label column sm={3} className="fw-bold text-end">
              Type Name:
            </Form.Label>
            <Col sm={9}>
              <input
                type="text"
                className="form-control"
                id="formTypeName"
                placeholder="Enter type name"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </Col>
          </Form.Group>
        </Form>

        {error && <p className="text-danger">{error}</p>}

        <Row className="justify-content-center">
          <Col sm={12} className="text-center">
            <Button
              variant="success"
              onClick={handleAddType}
              disabled={loading}>
              {loading ? "Adding..." : "Add Type"}
            </Button>
          </Col>
        </Row>
      </div>

      <div className="d-flex flex-column align-items-center mb-4">
        <Table bordered>
          <thead>
            <tr>
              <th>#</th>
              <th>Type Name</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(typeList) && typeList.length > 0 ? (
              typeList.map((type, index) => (
                <tr key={type.id}>
                  <td>{index + 1}</td>
                  <td>{type.TypeName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center">
                  No types available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
