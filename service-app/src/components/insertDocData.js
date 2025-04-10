import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import * as XLSX from "xlsx";
import { UrlContext } from "../router/route";

export default function InsertDocData() {
  const { url } = React.useContext(UrlContext);
  const [singleFile, setSingleFile] = useState(null);
  const [previewData, setPreviewData] = useState(null); // Parsed Excel data for preview
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle file change for single Excel file upload
  const handleSingleFileChange = (e) => {
    const file = e.target.files[0];
    setSingleFile(file);
    setPreviewData(null); // Clear previous preview if any
  };

  // Parse Excel file and update previewData state
  const handlePreview = () => {
    if (!singleFile) {
      alert("Please select an Excel file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        alert("Excel file is empty or invalid");
        return;
      }

      // Map Excel columns to required fields
      const mappedData = jsonData.map((row) => {
        const parseDate = (value) => {
          if (!value) return "";
          if (typeof value === "number") {
            // Convert Excel serial number to JS date string
            const excelDate = XLSX.SSF
              ? XLSX.SSF.format("yyyy-mm-dd", value)
              : new Date((value - 25569) * 86400 * 1000)
                  .toISOString()
                  .split("T")[0];
            return excelDate;
          }
          return value; // Assume it's already a string
        };

        return {
          DeviceName: row.DeviceName || row["Device Name"] || "",
          serialNumber: row.serialNumber || row["Serial Number"] || "",
          contractNo: row.contractNo || row["Contract Number"] || "",
          divisionID: row.divisionID || row["Division ID"] || "",
          price: parseFloat(
            row.price ||
              row.Price ||
              row["Price"] ||
              row["price"] ||
              row["PRICE"] ||
              "0"
          ),
          startDate: parseDate(row.startDate || row["Issue Date"]),
          endDate: parseDate(row.endDate || row["Expire Date"]),
          vendorName: row.vendorName || row["Vendor Name"] || "",
        };
      });

      setPreviewData(mappedData);
    };

    reader.readAsArrayBuffer(singleFile);
  };

  // Handle all submissions with a single button
  const handleSubmit = async () => {
    if (uploading) return;

    setUploading(true);

    try {
      // Handle Excel data if present
      if (previewData) {
        // Insert the service data first
        const serviceResponse = await axios.post(url + "service/insertdata", {
          data: previewData,
        });

        // Extract serviceID from the response
        const serviceID = serviceResponse.data.id; // Assuming backend returns serviceID

        // Now handle file upload if present
        if (multipleFiles.length > 0) {
          const fileTypes = multipleFiles.map((file) => {
            // Detect file type based on the file name
            if (file.name.toLowerCase().includes("pr")) {
              return "pr";
            } else if (file.name.toLowerCase().includes("po")) {
              return "po";
            } else if (file.name.toLowerCase().includes("contract")) {
              return "contract";
            } else {
              return "unknown"; // Default file type if no match
            }
          });

          const formData = new FormData();
          multipleFiles.forEach((file) => formData.append("files", file));
          formData.append("serviceID", serviceID); // Attach serviceID
          formData.append("fileTypes", JSON.stringify(fileTypes)); // Attach file types

          // Upload the files and link to the service
          await axios.post(url + "service/insertdoc", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          alert("Files uploaded and linked to service successfully");
        }

        alert("Service data saved successfully");
      }

      // Reset states after submission
      setSingleFile(null);
      setPreviewData(null);
      setMultipleFiles([]);
    } catch (err) {
      console.error("Error during submission:", err);
      alert("An error occurred during submission");
    } finally {
      setUploading(false);
    }
  };

  // Setup Dropzone for multiple file upload
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setMultipleFiles((prevFiles) => [...prevFiles, ...acceptedFiles]); // Add files to the previous array
    },
    multiple: true,
  });

  return (
    <div className="container">
      <h2>Upload Document</h2>

      {/* Single Excel file section with preview */}
      <div className="mt-5">
        <input
          type="file"
          className="form-control"
          accept=".xlsx, .xls"
          onChange={handleSingleFileChange}
        />
        <div>
          <small>
            If you don't have a template, please download an Excel template{" "}
            <a href="/template.xlsx" download>
              HERE
            </a>
          </small>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-primary me-2"
            onClick={handlePreview}
            disabled={uploading || !singleFile}>
            {uploading ? "Processing..." : "Preview"}
          </button>
        </div>
        {singleFile && !previewData && (
          <div className="mt-3">
            <p>Selected File: {singleFile.name}</p>
          </div>
        )}
      </div>

      {/* Preview Table for Excel Data */}
      {previewData && (
        <div className="mt-5">
          <h4>Preview Data</h4>
          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell.toString()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multiple file upload section with preview */}
      <div className="mb-3 mt-5">
        <div
          {...getRootProps()}
          className="dropzone p-3 border border-dashed"
          style={{
            borderColor: "#007bff",
            borderWidth: "2px",
            borderRadius: "4px",
            textAlign: "center",
          }}>
          <input {...getInputProps()} />
          <p>Drag & Drop your files here, or click to select files</p>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={uploading}>
            {uploading ? "Uploading..." : "Submit All"}
          </button>
        </div>

        {multipleFiles.length > 0 && (
          <div className="mt-3">
            <h4>Preview Selected Files:</h4>
            <ul>
              {multipleFiles.map((file, index) => (
                <li key={index}>{file.name}</li> // List all selected files
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
