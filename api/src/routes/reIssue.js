
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

const calculateWarrantyStatus = (startDate, endDate, warrantyCount) => {
  const warrantyMonths = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let i = 0; i < warrantyCount; i++) {
    const warrantyMonth = new Date(start);
    warrantyMonth.setMonth(start.getMonth() + i);
    if (warrantyMonth <= end) {
      warrantyMonths.push(warrantyMonth.getMonth()); // Store the month index
    }
  }

  return warrantyMonths;
};

router.post("/", async (req, res) => {
  try {
    const getDataArray = (body) => {
      if (Array.isArray(body)) return body;
      if (Array.isArray(body.data)) return body.data;
      return [body.data || body];
    };

    const dataArray = getDataArray(req.body);

    if (!dataArray || dataArray.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    const insertedServiceIDs = [];

    for (const data of dataArray) {
      const {
        DeviceName,
        divisionID,
        price,
        startDate,
        endDate,
        vendorName,
        serialNumber,
        contractNo,
        Brand,
        Model,
        Type,
        Location,
        WarrantyCount,
        prFileName,
        poFileName,
        contractFileName,
      } = data;

      if (!DeviceName || !divisionID) {
        return res.status(400).json({ error: "Missing required fields!!!" });
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
      request.input("serialNumber", db.sql.VarChar, serialNumber);
      request.input("contractNo", db.sql.VarChar, contractNo);
      request.input("totalMonth", db.sql.Int, months);
      request.input("Brand", db.sql.VarChar, Brand);
      request.input("Model", db.sql.VarChar, Model);
      request.input("Type", db.sql.VarChar, Type);
      request.input("Location", db.sql.VarChar, Location);
      request.input("WarrantyCount", db.sql.Int, WarrantyCount || 0);

      try {
        const result = await request.query(`
          INSERT INTO Service (DeviceName, divisionID, price, startDate, endDate, vendorName, serialNumber, contractNo, totalMonth, Brand, Model, Type, Location, WarrantyCount)
          VALUES (@DeviceName, @divisionID, @price, @startDate, @endDate, @vendorName, @serialNumber, @contractNo, @totalMonth, @Brand, @Model, @Type, @Location, @WarrantyCount)
          SELECT SCOPE_IDENTITY() AS serviceID;
        `);

        const serviceID = result.recordset
          ? result.recordset[0]?.serviceID
          : null;
        if (!serviceID) {
          return res.status(500).json({ error: "Failed to insert service." });
        }

        // Insert service details for each month
        for (const chargeDate of chargeDates) {
          const serviceDetailRequest = pool.request();
          serviceDetailRequest.input("serviceID", db.sql.Int, serviceID);
          serviceDetailRequest.input("chargeDate", db.sql.Date, chargeDate);
          serviceDetailRequest.input(
            "monthlyCharge",
            db.sql.Float,
            monthlyCharge
          );

          await serviceDetailRequest.query(`
            INSERT INTO ServiceDetail (serviceID, charge_date, monthly_charge)
            VALUES (@serviceID, @chargeDate, @monthlyCharge);
          `);
        }

        // Insert into ServiceDocument if prFileName, poFileName, contractFileName are present
        if (prFileName) {
          const docReq = pool.request();
          docReq.input("serviceID", db.sql.Int, serviceID);
          docReq.input("DocName", db.sql.NVarChar, prFileName);
          docReq.input("DocType", db.sql.NVarChar, "pr");
          docReq.input("DocPath", db.sql.NVarChar, null);
          await docReq.query(`
            INSERT INTO ServiceDocument (serviceID, DocName, DocType, DocPath)
            VALUES (@serviceID, @DocName, @DocType, @DocPath)
          `);
        }
        if (poFileName) {
          const docReq = pool.request();
          docReq.input("serviceID", db.sql.Int, serviceID);
          docReq.input("DocName", db.sql.NVarChar, poFileName);
          docReq.input("DocType", db.sql.NVarChar, "po");
          docReq.input("DocPath", db.sql.NVarChar, null);
          await docReq.query(`
            INSERT INTO ServiceDocument (serviceID, DocName, DocType, DocPath)
            VALUES (@serviceID, @DocName, @DocType, @DocPath)
          `);
        }
        if (contractFileName) {
          const docReq = pool.request();
          docReq.input("serviceID", db.sql.Int, serviceID);
          docReq.input("DocName", db.sql.NVarChar, contractFileName);
          docReq.input("DocType", db.sql.NVarChar, "contract");
          docReq.input("DocPath", db.sql.NVarChar, null);
          await docReq.query(`
            INSERT INTO ServiceDocument (serviceID, DocName, DocType, DocPath)
            VALUES (@serviceID, @DocName, @DocType, @DocPath)
          `);
        }

        insertedServiceIDs.push(serviceID);
      } catch (queryError) {
        console.error("SQL Query Error:", queryError);
        return res.status(500).json({ error: "Database query failed" });
      }
    }

    res.status(201).json({
      message: "Service and service details added successfully",
      serviceID: insertedServiceIDs[0],
    });
  } catch (error) {
    console.error("Error inserting service:", error);
    res.status(500).json({ error: "Database error" });
  }
});