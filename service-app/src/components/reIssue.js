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
  Table,
} from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { useUser } from "../context/userContext";

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
  const { user, activeDivision } = useUser();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [divisionQuery, setDivisionQuery] = useState("");
  const [totalPriceQuery, setTotalPriceQuery] = useState("");
  const [pricePerMonthQuery, setPricePerMonthQuery] = useState("");
  const [vendorNameQuery, setVendorNameQuery] = useState("");
  const [dateOfIssueQuery, setDateOfIssueQuery] = useState("");
  const [dateOfExpiredQuery, setDateOfExpiredQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [deviceQuery, setDeviceQuery] = useState("");
  const [serialQuery, setSerialQuery] = useState("");
  const [contractQuery, setContractQuery] = useState("");

  const [tempDeviceQuery, setTempDeviceQuery] = useState("");
  const [tempSerialQuery, setTempSerialQuery] = useState("");
  const [tempContractQuery, setTempContractQuery] = useState("");
  const [tempDivisionQuery, setTempDivisionQuery] = useState("");
  const [tempTotalPriceQuery, setTempTotalPriceQuery] = useState("");
  const [tempPricePerMonthQuery, setTempPricePerMonthQuery] = useState("");
  const [tempVendorNameQuery, setTempVendorNameQuery] = useState("");
  const [tempDateOfIssueQuery, setTempDateOfIssueQuery] = useState("");
  const [tempDateOfExpiredQuery, setTempDateOfExpiredQuery] = useState("");
  const [tempPriceMin, setTempPriceMin] = useState("");
  const [tempPriceMax, setTempPriceMax] = useState("");

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile || !fileType) {
      alert("Please select a file and file type before uploading.");
      return;
    }

    setUploadedFiles((prev) => [
      ...prev,
      { file: selectedFile, type: fileType },
    ]);
    setSelectedFile(null);
    setFileType("");
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch data
  const fetchData = useCallback(() => {
    axios
      .get(url + "service")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!activeDivision) return;

    const lowerSearch = searchQuery.toLowerCase();

    const isAdminOrManager =
      user.permissionCode === 2 || user.permissionCode === 3;

    let result = data.filter((item) => {
      const divisionMatch =
        isAdminOrManager || item.divisionID === activeDivision.id;

      const statusMatch =
        (status === 1 && item.expireStatusName?.toLowerCase() === "issued") ||
        (status === 2 &&
          item.expireStatusName?.toLowerCase() === "expire in 3 months") ||
        (status === 3 &&
          ["just expired", "expired"].includes(
            item.expireStatusName?.toLowerCase()
          ));

      const searchMatch =
        !searchQuery ||
        item.DeviceName?.toLowerCase().includes(lowerSearch) ||
        item.serialNumber?.toLowerCase().includes(lowerSearch) ||
        item.contractNo?.toLowerCase().includes(lowerSearch) ||
        item.vendorName?.toLowerCase().includes(lowerSearch);

      return divisionMatch && statusMatch && searchMatch;
    });

    if (deviceQuery) {
      result = result.filter((row) =>
        row.DeviceName?.toLowerCase().includes(deviceQuery.toLowerCase())
      );
    }

    if (serialQuery) {
      result = result.filter((row) =>
        row.serialNumber?.toLowerCase().includes(serialQuery.toLowerCase())
      );
    }

    if (contractQuery) {
      result = result.filter((row) =>
        row.contractNo?.toLowerCase().includes(contractQuery.toLowerCase())
      );
    }

    if (divisionQuery) {
      result = result.filter((row) =>
        row.divisionName?.toLowerCase().includes(divisionQuery.toLowerCase())
      );
    }

    if (totalPriceQuery) {
      result = result.filter((row) =>
        row.price?.toString().includes(totalPriceQuery)
      );
    }

    if (pricePerMonthQuery) {
      result = result.filter((row) =>
        row.monthly_charge?.toString().includes(pricePerMonthQuery)
      );
    }

    if (vendorNameQuery) {
      result = result.filter((row) =>
        row.vendorName?.toLowerCase().includes(vendorNameQuery.toLowerCase())
      );
    }

    if (dateOfIssueQuery && !isNaN(new Date(dateOfIssueQuery).getTime())) {
      result = result.filter((row) =>
        row.startDate?.includes(dateOfIssueQuery)
      );
    }

    if (dateOfExpiredQuery && !isNaN(new Date(dateOfExpiredQuery).getTime())) {
      result = result.filter((row) =>
        row.endDate?.includes(dateOfExpiredQuery)
      );
    }

    if (priceMin || priceMax) {
      result = result.filter((row) => {
        const price = parseFloat(row.monthly_charge);
        const min = priceMin ? parseFloat(priceMin) : -Infinity;
        const max = priceMax ? parseFloat(priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredData(result);
  }, [
    data,
    activeDivision,
    searchQuery,
    status,
    user.permissionCode,
    deviceQuery,
    serialQuery,
    contractQuery,
    divisionQuery,
    totalPriceQuery,
    pricePerMonthQuery,
    vendorNameQuery,
    dateOfIssueQuery,
    dateOfExpiredQuery,
    priceMin,
    priceMax,
  ]);

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearFilters = () => {
    setDivisionQuery("");
    setTotalPriceQuery("");
    setPricePerMonthQuery("");
    setVendorNameQuery("");
    setDateOfIssueQuery("");
    setDateOfExpiredQuery("");
    setPriceMin("");
    setPriceMax("");
    setDeviceQuery("");
    setSerialQuery("");
    setContractQuery("");
    setTempDeviceQuery("");
    setTempSerialQuery("");
    setTempContractQuery("");
    setTempDivisionQuery("");
    setTempTotalPriceQuery("");
    setTempPricePerMonthQuery("");
    setTempVendorNameQuery("");
    setTempDateOfIssueQuery("");
    setTempDateOfExpiredQuery("");
    setTempPriceMin("");
    setTempPriceMax("");
  };

  const handleApplyFilters = () => {
    setDeviceQuery(tempDeviceQuery);
    setSerialQuery(tempSerialQuery);
    setContractQuery(tempContractQuery);
    setDivisionQuery(tempDivisionQuery);
    setTotalPriceQuery(tempTotalPriceQuery);
    setPricePerMonthQuery(tempPricePerMonthQuery);
    setVendorNameQuery(tempVendorNameQuery);
    setDateOfIssueQuery(tempDateOfIssueQuery);
    setDateOfExpiredQuery(tempDateOfExpiredQuery);
    setPriceMin(tempPriceMin);
    setPriceMax(tempPriceMax);
    setShowFilterModal(false);
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
    { field: "contractNo", headerName: "Contract No.", flex: 1, minWidth: 100 },
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
          {user.permission === "Admin" && (
            <Link>
              <Button
                size="sm"
                variant="warning"
                onClick={() => handleEditClick(params.row)}>
                Edit
              </Button>
            </Link>
          )}
          <Link>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleReissueClick(params.row)}>
              Reissue
            </Button>
          </Link>
          {user.permission === "Admin" && (
            <Link to="/#">
              <Button size="sm" variant="danger">
                Delete
              </Button>
            </Link>
          )}
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

  const handleSaveChanges = () => {
    const updatedData = {};

    if (editData.DeviceName) updatedData.DeviceName = editData.DeviceName;
    if (editData.divisionName) updatedData.divisionName = editData.divisionName;
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

  const handleReissueSave = async () => {
    try {
      // Submit reissue data
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

      await axios.post(url + `service/insertdata`, updatedData);

      // Submit uploaded files
      if (uploadedFiles.length > 0) {
        const formDataFile = new FormData();
        uploadedFiles.forEach((file) => {
          formDataFile.append("files", file.file);
        });
        const fileTypes = uploadedFiles.map((file) => file.type);
        formDataFile.append("fileTypes", JSON.stringify(fileTypes));

        await axios.post(url + "service/insertdoc", formDataFile);
      }

      alert("Reissue completed successfully!");
      setShowReissueModal(false);
      setUploadedFiles([]);
      fetchData(); // Refresh grid
    } catch (error) {
      console.error("Error during reissue:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  return (
    <div className="main-container responsive-layout">
      <h2>
        Reissue -{" "}
        {status === 1
          ? "Issued"
          : status === 2
          ? "Expire in 3 Months"
          : "Expired Issues"}
      </h2>

      {/* Search Bar */}
      <div className="row mt-3">
        <div className="col-md-4"></div>
        <div className="col-md-4">
          <InputGroup className="mb-3">
            <FormControl
              placeholder=""
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
          </InputGroup>
        </div>
        <div className="col-md-4">
          <Button
            variant="info"
            className="text-center"
            size="md"
            onClick={() => setShowFilterModal(true)}>
            Filter
          </Button>
        </div>
      </div>

      {/* DataGrid */}
      <div
        className="mt-3"
        style={{
          height: "calc(100vh - 150px)",
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
          getRowId={(row) => row.serviceID ?? row.serialNumber ?? row.id}
          pagination
          pageSize={10}
          disableColumnMenu
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        animation={true}>
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
                    <Form.Control type="text" value={editData.DeviceName} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="divisionName">
                    <Form.Label>Division</Form.Label>
                    <Form.Control type="text" value={editData.divisionName} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
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
              </Row>

              <Row>
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
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reissue Modal */}
      <Modal
        show={showReissueModal}
        onHide={() => setShowReissueModal(false)}
        animation={true}>
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
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formDivisionName">
                    <Form.Label>Division Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.divisionName}
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formSerialNumber">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={reissueData.serialNumber}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formContractNo">
                    <Form.Label>Contract Number</Form.Label>
                    <Form.Control type="text" value={reissueData.contractNo} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
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

              {/* File Upload Section */}
              <div className="row mt-3">
                <div className="col-md-4">
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-control"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}>
                    <option value="">---Select Type---</option>
                    <option value="contract">Contract</option>
                    <option value="pr">PR</option>
                    <option value="po">PO</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-success"
                    onClick={handleUpload}
                    type="button"
                    disabled={!selectedFile || !fileType}>
                    Upload
                  </button>
                </div>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3">
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedFiles.map((file, index) => (
                        <tr key={index}>
                          <td>{file.file.name}</td>
                          <td>{file.type}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveFile(index)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
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

      <Modal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Filter Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row px-3 mt-3">
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="Device Name"
                  value={tempDeviceQuery}
                  onChange={(e) => setTempDeviceQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="S/N"
                  value={tempSerialQuery}
                  onChange={(e) => setTempSerialQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="Contract Number"
                  value={tempContractQuery}
                  onChange={(e) => setTempContractQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="Division"
                  value={tempDivisionQuery}
                  onChange={(e) => setTempDivisionQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="Total Price"
                  value={tempTotalPriceQuery}
                  onChange={(e) => setTempTotalPriceQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="Price / Month"
                  value={tempPricePerMonthQuery}
                  onChange={(e) => setTempPricePerMonthQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  placeholder="Vendor"
                  value={tempVendorNameQuery}
                  onChange={(e) => setTempVendorNameQuery(e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl
                  type="number"
                  placeholder="Min Price"
                  value={tempPriceMin}
                  onChange={(e) => setTempPriceMin(e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl
                  type="number"
                  placeholder="Max Price"
                  value={tempPriceMax}
                  onChange={(e) => setTempPriceMax(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  type="date"
                  placeholder="Date of Issue"
                  value={tempDateOfIssueQuery}
                  onChange={(e) => setTempDateOfIssueQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <FormControl
                  type="date"
                  placeholder="Date of Expired"
                  value={tempDateOfExpiredQuery}
                  onChange={(e) => setTempDateOfExpiredQuery(e.target.value)}
                />
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleApplyFilters}>
            Apply
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => {
              handleClearFilters();
            }}>
            Clear
          </Button>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
