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
} from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { useUser } from "../context/userContext";

export default function Main() {
  const { url } = useContext(UrlContext);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, activeDivision } = useUser();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [divisionQuery, setDivisionQuery] = useState("");
  const [totalPriceQuery, setTotalPriceQuery] = useState("");
  const [pricePerMonthQuery, setPricePerMonthQuery] = useState("");
  const [vendorNameQuery, setVendorNameQuery] = useState("");
  const [dateOfIssueQuery, setDateOfIssueQuery] = useState("");
  const [dateOfExpiredQuery, setDateOfExpiredQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
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
  const [tempStatusQuery, setTempStatusQuery] = useState("");
  const [tempPriceMin, setTempPriceMin] = useState("");
  const [tempPriceMax, setTempPriceMax] = useState("");

  const expireStatusOptions = [
    { label: "All", value: "" },
    { label: "Issued", value: "issued" },
    { label: "Expire in 3 months", value: "expire in 3 months" },
    { label: "Just Expired", value: "just expired" },
    { label: "Expired", value: "expired" },
  ];

  const handleClearFilters = () => {
    setDivisionQuery("");
    setTotalPriceQuery("");
    setPricePerMonthQuery("");
    setVendorNameQuery("");
    setDateOfIssueQuery("");
    setDateOfExpiredQuery("");
    setStatusQuery("");
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
    setTempStatusQuery("");
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
    setStatusQuery(tempStatusQuery);
    setPriceMin(tempPriceMin);
    setPriceMax(tempPriceMax);
    setShowFilterModal(false);
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
        const min = priceMin ? parseFloat(priceMin) : -Infinity;
        const max = priceMax ? parseFloat(priceMax) : Infinity;
        return price >= min && price <= max;
      };

      return (
        (!searchQuery ||
          matchesQuery(row.DeviceName, searchQuery) ||
          matchesQuery(row.serialNumber, searchQuery) ||
          matchesQuery(row.contractNo, searchQuery) ||
          matchesQuery(row.vendorName, searchQuery)) &&
        (!deviceQuery || matchesQuery(row.DeviceName, deviceQuery)) &&
        (!serialQuery || matchesQuery(row.serialNumber, serialQuery)) &&
        (!contractQuery || matchesQuery(row.contractNo, contractQuery)) &&
        (!divisionQuery || matchesQuery(row.divisionName, divisionQuery)) &&
        (!totalPriceQuery || row.price?.toString().includes(totalPriceQuery)) &&
        (!pricePerMonthQuery ||
          row.monthly_charge?.toString().includes(pricePerMonthQuery)) &&
        (!vendorNameQuery || matchesQuery(row.vendorName, vendorNameQuery)) &&
        matchesDate(row.startDate, dateOfIssueQuery) &&
        matchesDate(row.endDate, dateOfExpiredQuery) &&
        (!statusQuery ||
          row.expireStatusName?.toLowerCase() === statusQuery.toLowerCase()) &&
        matchesPriceRange(parseFloat(row.price))
      );
    });
  }, [
    data,
    activeDivision,
    searchQuery,
    user.permissionCode,
    priceMin,
    priceMax,
    divisionQuery,
    totalPriceQuery,
    pricePerMonthQuery,
    vendorNameQuery,
    dateOfIssueQuery,
    dateOfExpiredQuery,
    statusQuery,
    deviceQuery,
    serialQuery,
    contractQuery,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    { field: "DeviceName", headerName: "Device Name", flex: 1, minWidth: 120 },
    { field: "serialNumber", headerName: "S/N", flex: 1, minWidth: 120 },
    {
      field: "contractNo",
      headerName: "Contract Number",
      flex: 1,
      minWidth: 120,
    },
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
    <div className="main-container responsive-layout">
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
                  placeholder="Vendor"
                  value={tempVendorNameQuery}
                  onChange={(e) => setTempVendorNameQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Select
                  value={tempStatusQuery}
                  onChange={(e) => setTempStatusQuery(e.target.value)}>
                  {expireStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
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
