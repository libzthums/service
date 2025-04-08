import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function UploadPage() {
  return (
    <div className="d-flex flex-column align-items-center">
      <h2 className="mb-5">Upload</h2>
      <Row className="justify-content-between w-70">
        <Col xs={12} md={4} className="mb-3">
          <Link to="/insert" className="text-decoration-none">
            <Card className="shadow-sm p-4 text-center rounded-3 d-flex justify-content-center align-items-center">
              <i className="nav-icon fas fa-table fs-1 mb-3"></i>
              <h5>Upload Manual</h5>
            </Card>
          </Link>
        </Col>

        <Col xs={12} md={4} className="mb-3">
          <Link to="/insertDocData" className="text-decoration-none">
            <Card className="shadow-sm p-4 text-center rounded-3 d-flex justify-content-center align-items-center">
              <i className="nav-icon fa fa-file fs-1 mb-3"></i>
              <h5>Document Upload</h5>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}
