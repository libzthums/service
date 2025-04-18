import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { UrlContext } from "../router/route";
import { Link } from "react-router-dom";
import { Button, Badge, InputGroup, FormControl } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { useUser } from "../context/userContext";

export default function Main() {
  const { url } = useContext(UrlContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const { activeDivision } = useUser();

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

    const divisionFiltered = data.filter(
      (item) => item.divisionID === activeDivision.id
    );

    if (!searchQuery) {
      setFilteredData(divisionFiltered);
      setFiltersApplied(false);
    } else {
      const query = searchQuery.toLowerCase();
      const result = divisionFiltered.filter(
        (row) =>
          row.DeviceName?.toLowerCase().includes(query) ||
          row.serialNumber?.toLowerCase().includes(query) ||
          row.contractNo?.toLowerCase().includes(query) ||
          row.vendorName?.toLowerCase().includes(query)
      );
      setFilteredData(result);
      setFiltersApplied(true);
    }
  }, [data, activeDivision, searchQuery]);

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFiltersApplied(false);
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
          <Button variant="info">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <h2>Service</h2>

      <div className="mt-3">
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search by Device Name, Serial Number, Contract Number or Vendor Name"
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
        </InputGroup>
      </div>

      {filtersApplied && (
        <Button
          variant="secondary"
          onClick={handleClearSearch}
          className="mb-3">
          Clear Search
        </Button>
      )}

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
          pageSize={10}
          disableColumnMenu
          rowsPerPageOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
}
