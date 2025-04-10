import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { UrlContext } from "../router/route";
import { Link, useLocation } from "react-router-dom";
import { Button, Badge, Table } from "react-bootstrap";

export default function TotalPage() {
  const { url } = useContext(UrlContext);
  const location = useLocation();
  const status = location?.state?.status || 1;

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [filteredData, setFilteredData] = useState([]);

  const fetchData = useCallback(() => {
    axios
      .get(url + "service")
      .then((res) => {
        const result = [];

        res.data.forEach((item) => {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const charge = Number(item.monthly_charge);

          let current = new Date(start);

          while (current <= end) {
            const currentMonth = current.getMonth();
            const currentYear = current.getFullYear();

            const isExpiringSoon =
              item.expireStatusName?.toLowerCase() === "expire in 3 months";

            const isPerMonth =
              status === 1 &&
              (item.expireStatusName?.toLowerCase() === "issued" ||
                isExpiringSoon);

            const monthsDiff =
              (end.getFullYear() - start.getFullYear()) * 12 +
              (end.getMonth() - start.getMonth());

            const isPerYear =
              status === 2 && (monthsDiff >= 11 || isExpiringSoon);

            const matchesType = isPerMonth || isPerYear;

            const inMonth = currentMonth === month && currentYear === year;

            const inYear = currentYear === year;

            const shouldInclude =
              matchesType && (status === 1 ? inMonth : inYear);

            if (shouldInclude) {
              result.push({
                ...item,
                displayMonth: new Date(current),
                monthlyCharge: charge,
              });
            }

            current.setMonth(current.getMonth() + 1);
          }
        });

        setFilteredData(result);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
      });
  }, [url, status, month, year]);

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

  return (
    <div className="p-3">
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

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {/* <th>Month</th> */}
            <th>Device name</th>
            <th>S/N</th>
            <th>contractNo.</th>
            <th>Division</th>
            <th>Monthly charge</th>
            <th>Vendor</th>
            <th>Date of issue</th>
            <th>Date of expire</th>
            <th>Status</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No records found.
              </td>
            </tr>
          ) : (
            filteredData.map((item, index) => (
              <tr key={`${item.serviceID}-${index}`}>
                {/* <td>
                  {item.displayMonth.toLocaleString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </td> */}
                <td>{item.DeviceName}</td>
                <td>{item.serialNumber}</td>
                <td>{item.contractNo}</td>
                <td>{item.divisionName}</td>
                <td>{item.monthlyCharge.toLocaleString()}</td>
                <td>{item.vendorName}</td>
                <td>{formatDate(item.startDate)}</td>
                <td>{formatDate(item.endDate)}</td>
                <td>
                  <Badge bg={getStatusVariant(item.expireStatusName)}>
                    {item.expireStatusName}
                  </Badge>
                </td>
                <td>
                  <Link to={`/docDetail/${item.serviceID}`}>
                    <Button variant="info" size="sm">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))
          )}
          <tr>
            <td colSpan="5" className="fw-bold">
              Total {status === 1 ? "monthly" : "yearly"} cost
            </td>
            <td colSpan="4" className="fw-bold">
              {totalPrice.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
