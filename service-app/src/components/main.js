import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { UrlContext } from "../router/route";
import { Link } from "react-router-dom";
import {
  Button,
  Badge,
  InputGroup,
  FormControl,
  Modal,
  Form,
  Col,
  Row,
  FormGroup,
  FormLabel,
} from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { useUser } from "../context/userContext";

export default function Main() {
  const { url } = useContext(UrlContext);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, activeDivision } = useUser();

  const [showFilterModal, setShowFilterModal] = useState(false);

  // Consolidate all filter states into a single object
  const [filters, setFilters] = useState({
    divisionQuery: "",
    totalPriceQuery: "",
    pricePerMonthQuery: "",
    vendorNameQuery: "",
    dateOfIssueQuery: "",
    dateOfExpiredQuery: "",
    statusQuery: "",
    priceMin: "",
    priceMax: "",
    deviceQuery: "",
    serialQuery: "",
    contractQuery: "",
    brandQuery: "",
    modelQuery: "",
    typeQuery: "",
    locationQuery: "",
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [typeList, setTypeList] = useState([]);

  const expireStatusOptions = [
    { label: "All Status", value: "" },
    { label: "Issued", value: "issued" },
    { label: "Expire in 3 months", value: "expire in 3 months" },
    { label: "Just Expired", value: "just expired" },
    { label: "Expired", value: "expired" },
  ];

  const handleClearFilters = () => {
    const clearedFilters = {
      divisionQuery: "",
      totalPriceQuery: "",
      pricePerMonthQuery: "",
      vendorNameQuery: "",
      dateOfIssueQuery: "",
      dateOfExpiredQuery: "",
      statusQuery: "",
      priceMin: "",
      priceMax: "",
      deviceQuery: "",
      serialQuery: "",
      contractQuery: "",
      brandQuery: "",
      modelQuery: "",
      typeQuery: "",
      locationQuery: "",
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters); // Apply temporary filters
    setShowFilterModal(false); // Close the modal
  };

  const fetchData = useCallback(() => {
    axios
      .get(url + "service")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again later.");
      });
  }, [url]);

  const filterData = useCallback(() => {
    if (!activeDivision) return [];

    let visibleData =
      user.permissionCode === 2 || user.permissionCode === 3
        ? data
        : data.filter((item) => item.divisionID === activeDivision.id);

    return visibleData.filter((row) => {
      const matchesQuery = (field, query) =>
        field?.toLowerCase().includes(query.toLowerCase());

      const matchesDate = (field, query) =>
        query && !isNaN(new Date(query).getTime())
          ? field?.includes(query)
          : true;

      const matchesPriceRange = (price) => {
        const min = filters.priceMin ? parseFloat(filters.priceMin) : -Infinity;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
        return price >= min && price <= max;
      };

      return (
        (!searchQuery ||
          matchesQuery(row.DeviceName, searchQuery) ||
          matchesQuery(row.serialNumber, searchQuery) ||
          matchesQuery(row.contractNo, searchQuery) ||
          matchesQuery(row.vendorName, searchQuery)) &&
        (!filters.deviceQuery ||
          matchesQuery(row.DeviceName, filters.deviceQuery)) &&
        (!filters.serialQuery ||
          matchesQuery(row.serialNumber, filters.serialQuery)) &&
        (!filters.contractQuery ||
          matchesQuery(row.contractNo, filters.contractQuery)) &&
        (!filters.divisionQuery ||
          matchesQuery(row.divisionName, filters.divisionQuery)) &&
        (!filters.totalPriceQuery ||
          row.price?.toString().includes(filters.totalPriceQuery)) &&
        (!filters.pricePerMonthQuery ||
          row.monthly_charge
            ?.toString()
            .includes(filters.pricePerMonthQuery)) &&
        (!filters.vendorNameQuery ||
          matchesQuery(row.vendorName, filters.vendorNameQuery)) &&
        matchesDate(row.startDate, filters.dateOfIssueQuery) &&
        matchesDate(row.endDate, filters.dateOfExpiredQuery) &&
        (!filters.statusQuery ||
          row.expireStatusName?.toLowerCase() ===
            filters.statusQuery.toLowerCase()) &&
        matchesPriceRange(parseFloat(row.price)) &&
        (!filters.brandQuery || matchesQuery(row.Brand, filters.brandQuery)) &&
        (!filters.modelQuery || matchesQuery(row.Model, filters.modelQuery)) &&
        (!filters.typeQuery || matchesQuery(row.Type, filters.typeQuery)) &&
        (!filters.locationQuery ||
          matchesQuery(row.Location, filters.locationQuery))
      );
    });
  }, [data, activeDivision, searchQuery, user.permissionCode, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchTypeList = async () => {
      try {
        const response = await axios.get(url + "service/typelist");
        setTypeList(response.data);
      } catch (error) {
        console.error("Error fetching type list:", error);
      }
    };

    fetchTypeList();
  }, [url]);

  const filteredData = useMemo(() => filterData(), [filterData]);

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const columns = [
    { field: "DeviceName", headerName: "Description", flex: 1, minWidth: 170 },
    { field: "serialNumber", headerName: "S/N", flex: 1, minWidth: 120 },
    {
      field: "contractNo",
      headerName: "Contract No.",
      flex: 1,
      minWidth: 120,
    },
    { field: "Brand", headerName: "Brand", flex: 1, minWidth: 120 },
    { field: "Model", headerName: "Model", flex: 1, minWidth: 120 },
    { field: "Type", headerName: "Type", flex: 1, minWidth: 120 },
    { field: "Location", headerName: "Location", flex: 1, minWidth: 120 },
    { field: "divisionName", headerName: "Division", flex: 1, minWidth: 120 },
    { field: "price", headerName: "Total Price", flex: 1, minWidth: 120 },
    {
      field: "monthly_charge",
      headerName: "Price/Month",
      flex: 1,
      minWidth: 120,
    },
    { field: "vendorName", headerName: "Vendor", flex: 1, minWidth: 120 },
    {
      field: "startDate",
      headerName: "Date of Issue",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <span>{formatDate(params.row?.startDate)}</span>,
    },
    {
      field: "endDate",
      headerName: "Date of Expired",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <span>{formatDate(params.row?.endDate)}</span>,
    },
    {
      field: "expireStatusName",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Badge pill bg={getStatusVariant(params.row?.expireStatusName)}>
          {params.row?.expireStatusName || "N/A"}
        </Badge>
      ),
    },
    {
      field: "actions",
      headerName: "Document",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Link to={`/docDetail/${params.row?.serviceID}`}>
          <Button variant="primary">View</Button>
        </Link>
      ),
    },
  ];

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  return (
    <div className="container p-4">
      <h2>Service</h2>
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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableColumnMenu
        />
      </div>

      <Modal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Filter Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="px-3 mt-3">
              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Description"
                  value={tempFilters.deviceQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      deviceQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3" />

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="S/N"
                  value={tempFilters.serialQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      serialQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Contract No."
                  value={tempFilters.contractQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      contractQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Brand"
                  value={tempFilters.brandQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      brandQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Model"
                  value={tempFilters.modelQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      modelQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Select
                  value={tempFilters.typeQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      typeQuery: e.target.value,
                    })
                  }>
                  <option value="">Select Type</option>
                  {typeList.map((type) => (
                    <option key={type.TypeId} value={type.TypeName}>
                      {type.TypeName}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Location"
                  value={tempFilters.locationQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      locationQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Total Price"
                  value={tempFilters.totalPriceQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      totalPriceQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={3} className="mb-3">
                <FormControl
                  type="number"
                  placeholder="Min Price"
                  value={tempFilters.priceMin}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, priceMin: e.target.value })
                  }
                />
              </Col>

              <Col md={3} className="mb-3">
                <FormControl
                  type="number"
                  placeholder="Max Price"
                  value={tempFilters.priceMax}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, priceMax: e.target.value })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <FormControl
                  placeholder="Vendor"
                  value={tempFilters.vendorNameQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      vendorNameQuery: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Select
                  value={tempFilters.statusQuery}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      statusQuery: e.target.value,
                    })
                  }>
                  {expireStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <FormGroup>
                  <FormLabel>Date of Issue</FormLabel>
                  <FormControl
                    type="date"
                    placeholder="Date of Issue"
                    value={tempFilters.dateOfIssueQuery}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        dateOfIssueQuery: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>

              <Col md={6} className="mb-3">
                <FormGroup>
                  <FormLabel>Date of Expired</FormLabel>
                  <FormControl
                    type="date"
                    placeholder="Date of Expired"
                    value={tempFilters.dateOfExpiredQuery}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        dateOfExpiredQuery: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleApplyFilters}>
            Apply
          </Button>
          <Button variant="outline-danger" onClick={handleClearFilters}>
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
