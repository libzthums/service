import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { UrlContext } from "../router/route";
import {
  Button,
  Badge,
  InputGroup,
  FormControl,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";

export default function Reissue() {
  const { url } = useContext(UrlContext);
  const location = useLocation();
  const status = location.state?.status || 1;

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showReissueModal, setShowReissueModal] = useState(false);
  const [reissueData, setReissueData] = useState(null);

  // Fetch data
  const fetchData = useCallback(() => {
    axios
      .get(url + "service")
      .then((response) => {
        setData(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on status
  useEffect(() => {
    let filtered = data;
    if (status === 1) {
      filtered = data.filter(
        (row) => row.expireStatusName?.toLowerCase() === "issued"
      );
    } else if (status === 2) {
      filtered = data.filter(
        (row) => row.expireStatusName?.toLowerCase() === "expire in 3 months"
      );
    } else if (status === 3) {
      filtered = data.filter(
        (row) =>
          row.expireStatusName?.toLowerCase() === "just expired" ||
          row.expireStatusName?.toLowerCase() === "expired"
      );
    }
    setFilteredData(filtered);
  }, [data, status]);

  // Handle search
  const handleSearchQueryChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredData(data);
    } else {
      const searchedData = data.filter(
        (row) =>
          row.DeviceName?.toLowerCase().includes(query) ||
          row.serialNumber?.toLowerCase().includes(query) ||
          row.contractNo?.toLowerCase().includes(query) ||
          row.vendorName?.toLowerCase().includes(query)
      );
      setFilteredData(searchedData);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredData(data);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  // Set badge color for Expire Status
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "success";
      case "expire in 3 months":
        return "warning";
      case "just expired":
        return "danger";
      case "expired":
        return "dark";
      default:
        return "secondary";
    }
  };

  // DataGrid Columns
  const columns = [
    { field: "DeviceName", headerName: "Device", flex: 1, minWidth: 100 },
    { field: "serialNumber", headerName: "S/N", flex: 1, minWidth: 100 },
    { field: "contractNo", headerName: "Contract", flex: 1, minWidth: 100 },
    { field: "divisionName", headerName: "Division", flex: 1, minWidth: 100 },
    { field: "price", headerName: "Total Price", flex: 1, minWidth: 100 },
    {
      field: "vendorName",
      headerName: "Vendor",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "startDate",
      headerName: "Issued Date",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => <span>{formatDate(params.row?.startDate)}</span>,
    },
    {
      field: "endDate",
      headerName: "Expired Date",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Badge pill bg={getStatusVariant(params.row?.expireStatusName)}>
          <span>{formatDate(params.row?.endDate)}</span>
        </Badge>
      ),
    },
    {
      field: "expireStatusName",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Badge pill bg={getStatusVariant(params.row?.expireStatusName)}>
          {params.row?.expireStatusName || "N/A"}
        </Badge>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <div className="d-flex flex-wrap gap-1">
          <Link to={`/docDetail/${params.row?.serviceID}`}>
            <Button size="sm" variant="info">
              View
            </Button>
          </Link>
          <Link>
            <Button
              size="sm"
              variant="warning"
              onClick={() => handleEditClick(params.row)}>
              Edit
            </Button>
          </Link>
          <Link>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleReissueClick(params.row)}>
              Reissue
            </Button>
          </Link>

          <Link to="/#">
            <Button size="sm" variant="danger">
              Delete
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const handleEditClick = (rowData) => {
    setEditData({ ...rowData });
    setShowEditModal(true);
  };

  const handleReissueClick = (rowData) => {
    setReissueData({ ...rowData });
    setShowReissueModal(true);
  };

  // Handle Save Changes (Form submission)
  const handleSaveChanges = () => {
    // Construct the updated data object with only the non-empty fields
    const updatedData = {};

    if (editData.DeviceName) updatedData.DeviceName = editData.DeviceName;
    if (editData.serialNumber) updatedData.serialNumber = editData.serialNumber;
    if (editData.contractNo) updatedData.contractNo = editData.contractNo;
    if (editData.price) updatedData.price = editData.price;
    if (editData.vendorName) updatedData.vendorName = editData.vendorName;
    if (editData.vendorPhone) updatedData.vendorPhone = editData.vendorPhone;
    if (editData.startDate) updatedData.startDate = editData.startDate;
    if (editData.endDate) updatedData.endDate = editData.endDate;
    if (editData.divisionID) updatedData.divisionID = editData.divisionID;

    // Only send the fields that are provided (non-empty)
    axios
      .put(url + `service/updatedata/${editData.serviceID}`, updatedData)
      .then((response) => {
        console.log("Data updated successfully", response);
        setShowEditModal(false);
        fetchData(); // Refresh data after update
      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  };

  const handleReissueSave = () => {
    const updatedData = {
      DeviceName: reissueData.DeviceName,
      serialNumber: reissueData.serialNumber,
      contractNo: reissueData.contractNo,
      price: reissueData.price,
      vendorName: reissueData.vendorName,
      vendorPhone: reissueData.vendorPhone,
      startDate: reissueData.startDate,
      endDate: reissueData.endDate,
      divisionID: reissueData.divisionID,
    };

    axios
      .put(`${url}service/insertdata`, updatedData)
      .then((response) => {
        console.log("Reissued successfully", response);
        setShowReissueModal(false);
        fetchData(); // Refresh grid
      })
      .catch((error) => {
        console.error("Error during reissue:", error);
      });
  };

  return (
    <div>
      <h2>
        Reissue -{" "}
        {status === 1
          ? "Issued"
          : status === 2
          ? "Expire in 3 Months"
          : "Expired Issues"}
      </h2>

      {/* Search Bar */}
      <div className="mt-3">
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search by Device Name, Serial Number, Contract Number or Vendor Name"
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
        </InputGroup>
      </div>

      {/* Clear Search Button */}
      {searchQuery && (
        <Button
          variant="secondary"
          onClick={handleClearSearch}
          className="mb-3">
          Clear Search
        </Button>
      )}

      {/* DataGrid */}
      <div
        className="mt-3"
        style={{
          height: "calc(100vh - 150px)", // Adjust dynamically
          width: "100%",
          overflowX: "auto",
          maxWidth: "100vw",
        }}>
        <DataGrid
          sx={{
            "& .MuiDataGrid-root": { width: "100%", minWidth: "700px" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8f9fa",
              fontSize: "14px",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiDataGrid-footerContainer": { justifyContent: "center" },
          }}
          rows={filteredData.length > 0 ? filteredData : []}
          columns={columns}
          getRowId={(row) => row.serviceID || Math.random()}
          autoPageSize
          disableColumnMenu
        />
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formDeviceName">
                    <Form.Label>Device Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editData.DeviceName}
                      onChange={(e) =>
                        setEditData({ ...editData, DeviceName: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formSerialNumber">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={editData.serialNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          serialNumber: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formContractNo">
                    <Form.Label>Contract Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={editData.contractNo}
                      onChange={(e) =>
                        setEditData({ ...editData, contractNo: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formPrice">
                    <Form.Label>Total Price</Form.Label>
                    <Form.Control
                      type="text"
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formVendorName">
                    <Form.Label>Vendor Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editData.vendorName}
                      onChange={(e) =>
                        setEditData({ ...editData, vendorName: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formStartDate">
                    <Form.Label>Issued Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={editData.startDate?.split("T")[0]} // Adjust for date format
                      onChange={(e) =>
                        setEditData({ ...editData, startDate: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formEndDate">
                    <Form.Label>Expired Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={editData.endDate?.split("T")[0]} // Adjust for date format
                      onChange={(e) =>
                        setEditData({ ...editData, endDate: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="warning" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reissue Modal */}
      <Modal show={showReissueModal} onHide={() => setShowReissueModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reissue Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reissueData && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formDeviceName">
                    <Form.Label>Device Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.DeviceName}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          DeviceName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formSerialNumber">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.serialNumber}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          serialNumber: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formContractNo">
                    <Form.Label>Contract Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.contractNo}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          contractNo: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formPrice">
                    <Form.Label>Total Price</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.price}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          price: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formVendorName">
                    <Form.Label>Vendor Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.vendorName}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          vendorName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                {/* <Col md={6}>
                  <Form.Group controlId="formVendorPhone">
                    <Form.Label>Vendor Phone</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.vendorPhone || ""}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          vendorPhone: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col> */}
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formStartDate">
                    <Form.Label>Issued Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reissueData.startDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formEndDate">
                    <Form.Label>Expired Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reissueData.endDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        setReissueData({
                          ...reissueData,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowReissueModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleReissueSave}>
            Save Reissue
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
