import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UrlContext } from "../router/route";

export default function InsertData({ onSuccess }) {
  const { url } = useContext(UrlContext);
  const [formData, setFormData] = useState({
    DeviceName: "",
    divisionID: "",
    price: "",
    startDate: "",
    endDate: "",
    vendorName: "",
    vendorPhone: "",
    serialNumber: "",
    contractNo: "",
  });

  const [division, setDivisions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    axios
      .get(url + "service/division")
      .then((response) => {
        setDivisions(response.data);
      })
      .catch((error) => console.error("Error fetching divisions:", error));
  }, [url]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // First submit form data
    axios
      .post(url + "service/insertdata", formData)
      .then(() => {
        alert("Service added successfully!");
        setFormData({
          DeviceName: "",
          divisionID: "",
          price: "",
          startDate: "",
          endDate: "",
          vendorName: "",
          vendorPhone: "",
          serialNumber: "",
          contractNo: "",
        });
        setUploadedFiles([]); // Clear uploaded files
        onSuccess();
      })
      .catch((error) => console.error("Error adding service:", error));

    // Then upload files if any
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const formDataFile = new FormData();
        formDataFile.append("file", file.file); // The file data
        formDataFile.append("fileType", file.type); // File type

        axios
          .post(url + "service/insertdoc", formDataFile)
          .then(() => {
            console.log("File uploaded successfully!");
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
          });
      });
    }
  };

  const handleClear = () => {
    setFormData({
      DeviceName: "",
      divisionID: "",
      price: "",
      startDate: "",
      endDate: "",
      vendorName: "",
      vendorPhone: "",
      serialNumber: "",
      contractNo: "",
    });
    setUploadedFiles([]);
  };

  // File Upload Logic
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile || !fileType) {
      alert("Please select a file and file type before uploading.");
      return;
    }

    // Add the uploaded file to the list
    setUploadedFiles([
      ...uploadedFiles,
      { file: selectedFile, type: fileType },
    ]);
    setSelectedFile(null);
    setFileType("");
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Manual Upload</h2>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Device Name */}
          <div className="col-md-6 mb-3">
            <label>Device Name</label>
            <input
              type="text"
              className="form-control"
              name="DeviceName"
              value={formData.DeviceName}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Serial Number */}
          <div className="col-md-6 mb-3">
            <label>Serial Number</label>
            <input
              type="text"
              className="form-control"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Contract Number */}
          <div className="col-md-6 mb-3">
            <label>Contract Number</label>
            <input
              type="text"
              className="form-control"
              name="contractNo"
              value={formData.contractNo}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Division Selection */}
          <div className="col-md-6 mb-3">
            <label>Division</label>
            <select
              className="form-control"
              name="divisionID"
              value={formData.divisionID}
              onChange={handleChange}
              required>
              <option value="">Select Division</option>
              {division.map((division) => (
                <option key={division.divisionID} value={division.divisionID}>
                  {division.divisionName}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="col-md-6 mb-3">
            <label>Price</label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Start Date */}
          <div className="col-md-6 mb-3">
            <label>Issue Date</label>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          {/* End Date */}
          <div className="col-md-6 mb-3">
            <label>Expired Date</label>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Vendor Name */}
          <div className="col-md-6 mb-3">
            <label>Vendor Name</label>
            <input
              type="text"
              className="form-control"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
        </div>

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
              className="btn btn-primary w-100"
              onClick={handleUpload}
              type="button"
              disabled={!selectedFile || !fileType}>
              Upload
            </button>
          </div>
        </div>

        {/* File List Table */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3">
            <table className="table table-bordered">
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
            </table>
          </div>
        )}

        {/* Submit & Clear Buttons */}
        <div className="form-group mt-3">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button
            type="button"
            className="btn btn-warning ml-2"
            onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
