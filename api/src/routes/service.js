const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db/sql");
const XLSX = require("xlsx");

// Multer setup for file upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { fileTypes } = req.body;

    // Validate fileTypes
    if (!fileTypes || fileTypes.length !== req.files.length) {
      return cb(new Error("Mismatch between files and file types."), null);
    }

    const fileType = fileTypes[req.files.indexOf(file)];
    let dirPath;

    // Determine the directory based on the fileType
    switch (fileType) {
      case "pr":
        dirPath = path.join("uploads", "ServicePRDocument");
        break;
      case "po":
        dirPath = path.join("uploads", "ServicePODocument");
        break;
      case "contract":
        dirPath = path.join("uploads", "ServiceDocument");
        break;
      default:
        return cb(new Error("Invalid file type."), null);
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath); // Save file in the appropriate directory based on fileType
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage }); // Initialize multer

// Function to generate charge dates for each month
const generateChargeDates = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return dates;
};

// Function to calculate expireStatus based on the endDate
const calculateExpireStatus = (endDate) => {
  const currentDate = new Date();
  const end = new Date(endDate);

  if (end > currentDate) {
    // If the end date is in the future
    const diffInDays = Math.floor((end - currentDate) / (1000 * 3600 * 24));

    if (diffInDays <= 90) {
      return 2; // expire in 3 months
    } else {
      return 1; // issued
    }
  } else {
    // If the end date is in the past
    const diffInDays = Math.floor((currentDate - end) / (1000 * 3600 * 24));

    if (diffInDays <= 30) {
      return 3; // just expired
    } else {
      return 4; // expired
    }
  }
};

// GET Route for fetching services
router.get("/", async (req, res) => {
  try {
    const query = `
    SELECT 
      service.serviceID, 
      service.DeviceName,
      service.serialNumber,
      service.contractNo,
      service.price,
      service.startDate, 
      service.endDate, 
      service.vendorName, 
      service.vendorPhone,
      division.divisionName,
      MAX(sd.monthly_charge) AS monthly_charge
    FROM Service AS service
    INNER JOIN Division AS division ON service.divisionID = division.divisionID
    LEFT JOIN ServiceDetail AS sd ON service.serviceID = sd.serviceID
    GROUP BY 
      service.serviceID, service.DeviceName, service.serialNumber, 
      service.contractNo, service.price, service.startDate, 
      service.endDate, service.vendorName, service.vendorPhone, 
      division.divisionName
    `;

    const data = await db.connectAndQuery(query);

    // Fetch status names from ServiceExpireCheck table
    const statusQuery = `SELECT status, statusName FROM ServiceExpireCheck`;
    const statusData = await db.connectAndQuery(statusQuery);

    // Convert status data to a dictionary for easy lookup
    const statusMap = statusData.reduce((acc, row) => {
      acc[row.status] = row.statusName;
      return acc;
    }, {});

    // Add expireStatus to each service and map to statusName
    const updatedData = data.map((row) => {
      const expireStatus = calculateExpireStatus(row.endDate);
      return {
        ...row,
        expireStatus,
        expireStatusName: statusMap[expireStatus] || "Unknown",
      };
    });

    res.json(updatedData);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).send("Server Error");
  }
});

// INSERT new service
router.post("/insertdata", async (req, res) => {
  try {
    const {
      DeviceName,
      divisionID,
      price,
      startDate,
      endDate,
      vendorName,
      vendorPhone,
      serialNumber,
      contractNo,
    } = req.body;

    if (!DeviceName || !divisionID || !serialNumber || !contractNo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const chargeDates = generateChargeDates(startDate, endDate);
    const months = chargeDates.length;
    const monthlyCharge = (price / months).toFixed(2);

    const pool = await db.connectDB();
    const request = pool.request();
    request.input("DeviceName", db.sql.VarChar, DeviceName);
    request.input("divisionID", db.sql.Int, divisionID);
    request.input("price", db.sql.Float, price);
    request.input("startDate", db.sql.Date, startDate);
    request.input("endDate", db.sql.Date, endDate);
    request.input("vendorName", db.sql.VarChar, vendorName);
    request.input("vendorPhone", db.sql.VarChar, vendorPhone);
    request.input("serialNumber", db.sql.VarChar, serialNumber);
    request.input("contractNo", db.sql.VarChar, contractNo);
    request.input("totalMonth", db.sql.Int, months);

    // Insert service data into the Service table
    const result = await request.query(`
      INSERT INTO Service (DeviceName, divisionID, price, startDate, endDate, vendorName, vendorPhone, serialNumber, contractNo, totalMonth)
      VALUES (@DeviceName, @divisionID, @price, @startDate, @endDate, @vendorName, @vendorPhone, @serialNumber, @contractNo, @totalMonth);
      SELECT SCOPE_IDENTITY() AS serviceID;
    `);

    const serviceID = result.recordset ? result.recordset[0]?.serviceID : null;
    if (!serviceID) {
      return res.status(500).json({ error: "Failed to insert service." });
    }

    // Insert service details for each month
    for (const chargeDate of chargeDates) {
      const serviceDetailRequest = pool.request();
      serviceDetailRequest.input("serviceID", db.sql.Int, serviceID);
      serviceDetailRequest.input("chargeDate", db.sql.Date, chargeDate);
      serviceDetailRequest.input("monthlyCharge", db.sql.Float, monthlyCharge);

      await serviceDetailRequest.query(`
        INSERT INTO ServiceDetail (serviceID, charge_date, monthly_charge)
        VALUES (@serviceID, @chargeDate, @monthlyCharge);
      `);
    }

    res.status(201).json({
      message: "Service and service details added successfully",
      id: serviceID,
    });
  } catch (error) {
    console.error("Error inserting service:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST route for file upload and linking to service
router.post("/insertdoc", upload.array("files", 10), async (req, res) => {
  try {
    // Ensure that files and fileTypes are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const { serviceID, fileTypes } = req.body; // Extract serviceID and file types from the request body

    if (!serviceID || !fileTypes || fileTypes.length !== req.files.length) {
      return res.status(400).send("Missing or mismatched file data.");
    }

    // Extract file details and insert them into the correct table in MSSQL
    const files = req.files.map((file, index) => ({
      serviceID, // Link the file to the serviceID
      fileName: file.filename,
      filePath: file.path,
      fileType: fileTypes[index], // Associate each file with its file type
    }));

    // Insert file metadata into MSSQL based on file type
    for (let file of files) {
      let tableName;

      switch (file.fileType) {
        case "pr":
          tableName = "ServicePRDocument";
          break;
        case "po":
          tableName = "ServicePODocument";
          break;
        case "contract":
          tableName = "ServiceDocument";
          break;
        default:
          return res.status(400).send("Invalid file type provided.");
      }

      const query = `
        INSERT INTO ${tableName} (serviceID, DocName, DocPath)
        VALUES (@ServiceID, @FileName, @FilePath)
      `;

      await db
        .request()
        .input("ServiceID", db.Int, file.serviceID) // Pass the serviceID from the request
        .input("FileName", db.NVarChar, file.fileName)
        .input("FilePath", db.NVarChar, file.filePath)
        .query(query);
    }

    res.status(200).send("Files uploaded and linked to service successfully.");
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).send("Error uploading files.");
  }
});

// Get Division
router.get("/division", async (req, res) => {
  try {
    const query = `SELECT divisionID, divisionName FROM Division`;
    const data = await db.connectAndQuery(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching divisions:", error);
    res.status(500).send("Server Error");
  }
});

router.put("/updatedata/:serviceID", async (req, res) => {
  try {
    const { serviceID } = req.params; // Get the serviceID from the request parameter
    const {
      DeviceName,
      divisionID,
      price,
      startDate,
      endDate,
      vendorName,
      vendorPhone,
      serialNumber,
      contractNo,
    } = req.body; // Get the updated data from the request body

    // Ensure required fields are provided
    if (
      !serviceID ||
      !DeviceName ||
      !divisionID ||
      !serialNumber ||
      !contractNo
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pool = await db.connectDB();
    const request = pool.request();

    // Input parameters for the update query
    request.input("DeviceName", db.sql.VarChar, DeviceName);
    request.input("divisionID", db.sql.Int, divisionID);
    request.input("price", db.sql.Float, price);
    request.input("startDate", db.sql.Date, startDate);
    request.input("endDate", db.sql.Date, endDate);
    request.input("vendorName", db.sql.VarChar, vendorName);
    request.input("vendorPhone", db.sql.VarChar, vendorPhone);
    request.input("serialNumber", db.sql.VarChar, serialNumber);
    request.input("contractNo", db.sql.VarChar, contractNo);
    request.input("serviceID", db.sql.Int, serviceID); // Pass the serviceID for identifying the record

    // Construct the UPDATE query
    const query = `
      UPDATE Service
      SET 
        DeviceName = @DeviceName,
        divisionID = @divisionID,
        price = @price,
        startDate = @startDate,
        endDate = @endDate,
        vendorName = @vendorName,
        vendorPhone = @vendorPhone,
        serialNumber = @serialNumber,
        contractNo = @contractNo
      WHERE serviceID = @serviceID;
    `;

    // Execute the update query
    const result = await request.query(query);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service updated successfully" });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
