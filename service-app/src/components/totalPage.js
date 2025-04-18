import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { UrlContext } from "../router/route";
import { Link, useLocation } from "react-router-dom";
import { Button, Badge } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { useUser } from "../context/userContext";

export default function TotalPage() {
  const { url } = useContext(UrlContext);
  const location = useLocation();
  const status = location?.state?.status || 1;
  const { activeDivision } = useUser();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [filteredData, setFilteredData] = useState([]);

  const fetchData = useCallback(() => {
    axios
      .get(url + "service")
      .then((res) => {
        const result = [];

        res.data
          .filter((item) => item.divisionID === activeDivision.id)
          .forEach((item) => {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const charge = Number(item.monthly_charge);

            const isExpiringSoon =
              item.expireStatusName?.toLowerCase() === "expire in 3 months";

            const monthsDiff =
              (end.getFullYear() - start.getFullYear()) * 12 +
              (end.getMonth() - start.getMonth());

            const isPerMonth =
              status === 1 &&
              (item.expireStatusName?.toLowerCase() === "issued" ||
                isExpiringSoon);

            const isPerYear =
              status === 2 && (monthsDiff >= 11 || isExpiringSoon);

            if (status === 1) {
              let current = new Date(start);
              while (current <= end) {
                const currentMonth = current.getMonth();
                const currentYear = current.getFullYear();
                const inMonth = currentMonth === month && currentYear === year;

                if (isPerMonth && inMonth) {
                  result.push({
                    ...item,
                    id: `${item.serviceID}-${currentMonth}`,
                    displayMonth: new Date(current),
                    monthlyCharge: charge,
                  });
                }

                current.setMonth(current.getMonth() + 1);
              }
            } else if (status === 2 && isPerYear) {
              const startY = start.getFullYear();
              const endY = end.getFullYear();

              if (startY <= year && endY >= year) {
                const monthsInYear = Array.from(
                  { length: 12 },
                  (_, i) => new Date(year, i)
                );
                const validMonths = monthsInYear.filter(
                  (m) => m >= start && m <= end
                );
                const monthsCount = validMonths.length;

                result.push({
                  ...item,
                  id: `${item.serviceID}-${year}`,
                  displayMonth: new Date(year, 0),
                  monthlyCharge: charge * monthsCount,
                });
              }
            }
          });

        setFilteredData(result);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
      });
  }, [url, status, month, year, activeDivision.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const totalPrice = filteredData.reduce((sum, item) => {
    return sum + (isNaN(item.monthlyCharge) ? 0 : item.monthlyCharge);
  }, 0);

  const handlePrev = () => {
    if (status === 1) {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      setYear(year - 1);
    }
  };

  const handleNext = () => {
    if (status === 1) {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    } else {
      setYear(year + 1);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  const columns = [
    { field: "DeviceName", headerName: "Device Name", flex: 1, minWidth: 120 },
    { field: "serialNumber", headerName: "S/N", flex: 1, minWidth: 120 },
    { field: "contractNo", headerName: "Contract No.", flex: 1, minWidth: 120 },
    { field: "divisionName", headerName: "Division", flex: 1, minWidth: 120 },
    {
      field: "monthlyCharge",
      headerName: "Monthly Charge",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => params.value.toLocaleString(),
    },
    { field: "vendorName", headerName: "Vendor", flex: 1, minWidth: 120 },
    {
      field: "startDate",
      headerName: "Date of Issue",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "endDate",
      headerName: "Date of Expire",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "expireStatusName",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Badge bg={getStatusVariant(params.value)}>{params.value}</Badge>
      ),
    },
    {
      field: "view",
      headerName: "View",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Link to={`/docDetail/${params.row.serviceID}`}>
          <Button variant="info" size="sm">
            View
          </Button>
        </Link>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className="p-3 d-flex flex-column" style={{ height: "100%" }}>
      <h4>
        Total cost {status === 1 ? "per month" : "per year"} in {year}
      </h4>

      <div className="d-flex justify-content-between align-items-center my-3">
        <Button variant="light" onClick={handlePrev}>
          &lt;&lt; {status === 1 ? "Previous month" : "Previous year"}
        </Button>

        <h5>
          {status === 1
            ? new Date(0, month).toLocaleString("en-US", { month: "long" })
            : ""}
        </h5>

        <Button variant="light" onClick={handleNext}>
          {status === 1 ? "Next month" : "Next year"} &gt;&gt;
        </Button>
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
          pageSize={10}
          disableColumnMenu
          rowsPerPageOptions={[10, 25, 50]}
        />
      </div>

      <div className="text-end mt-3 fw-bold fs-5">
        Total {status === 1 ? "monthly" : "yearly"} cost:
        {totalPrice.toLocaleString()}
      </div>
    </div>
  );
}
