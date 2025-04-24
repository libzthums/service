import React from "react";
import { Tabs, Tab, Row, Col, Form } from "react-bootstrap";

export default function SettingDivision() {
  return (
    <div className="d-flex flex-column px-3 container-fluid">
      <h2 className="mb-5 text-start w-100">Setting Division</h2>

      <div className="w-100 mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={2}>
            <label htmlFor="divisionName" className="fw-bold">
              Name
            </label>
          </Col>
          <Col xs={12} md={6}>
            <Form.Control
              id="divisionName"
              type="text"
            />
          </Col>
        </Row>
      </div>
      <div>
        <Row className="align-items-center mb-4">
          <Col xs={12} md={2}>
            <label htmlFor="divisionCode" className="fw-bold">
              Division
            </label>
          </Col>
          <Col xs={12} md={6}>
            <Form.Control
              id="divisionCode"
              type="text"
              className="mb-3"
            />
          </Col>
        </Row>
      </div>

      <Tabs
        defaultActiveKey="division"
        id="division-tabs"
        className="mb-3 w-100">
        <Tab eventKey="division" title="Division">
          <div className="p-3">
            <h5 className="fw-bold mb-3">Division List</h5>
          </div>
        </Tab>

        <Tab eventKey="subdivision" title="User">
          <div className="p-3">
            <h5 className="fw-bold mb-3">User List</h5>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
