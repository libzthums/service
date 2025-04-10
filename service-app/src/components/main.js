import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { UrlContext } from "../router/route";
import { Link } from "react-router-dom";
import { Button, Badge, InputGroup, FormControl } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";

export default function Main() {
  const { url } = useContext(UrlContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const fetchData = useCallback(() => {
    axios
      .get(url + "service")
      .then((response) => {
        setData(response.data);
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle search
  const handleSearchQueryChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredData(data);
      setFiltersApplied(false);
    } else {
      const filtered = data.filter(
        (row) =>
          row.DeviceName?.toLowerCase().includes(query) ||
          row.serialNumber?.toLowerCase().includes(query) ||
          row.contractNo?.toLowerCase().includes(query) ||
          row.vendorName?.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
      setFiltersApplied(true);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredData(data);
    setFiltersApplied(false);
  };

  // Badge color
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  // MUI DataGrid Columns
  const columns = [
    { field: "DeviceName", headerName: "Device Name", flex: 1, minWidth: 120 },
    {
      field: "serialNumber",
      headerName: "S/N",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "contractNo",
      headerName: "Contract Number",
      flex: 1,
      minWidth: 120,
    },
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
          <Button variant="info">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <h2>Service</h2>

      {/* Search Bar */}
      <div className="mt-3">
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search by Device Name, Serial Number, Contract Number or Vendor Name"
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
        </InputGroup>
      </div>

      {/* Clear Search Button */}
      {filtersApplied && (
        <Button
          variant="secondary"
          onClick={handleClearSearch}
          className="mb-3">
          Clear Search
        </Button>
      )}

      {/* MUI DataGrid */}
      <div
        className="mt-3"
        style={{ height: 500, width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={filteredData.length > 0 ? filteredData : []}
          columns={columns}
          getRowId={(row) => row.serviceID || Math.random()}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
}
