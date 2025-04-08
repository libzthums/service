const db = require("../db/sql");
const express = require("express");
const router = express.Router();

router.get("/pr/:serviceID", async (req, res) => {
  try {
    const { serviceID } = req.params;
    const pool = await db.connectDB();
    const query = `SELECT DocName, DocPath FROM ServicePRDocument WHERE serviceID = @serviceID`;

    const result = await pool
      .request()
      .input("serviceID", db.sql.Int, serviceID)
      .query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching PR documents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/po/:serviceID", async (req, res) => {
  try {
    const { serviceID } = req.params;
    const pool = await db.connectDB();
    const query = `SELECT DocName, DocPath FROM ServicePODocument WHERE serviceID = @serviceID`;

    const result = await pool
      .request()
      .input("serviceID", db.sql.Int, serviceID)
      .query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching PO documents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/contract/:serviceID", async (req, res) => {
  try {
    const { serviceID } = req.params;
    const pool = await db.connectDB();
    const query = `SELECT DocName, DocPath FROM ServiceDocument WHERE serviceID = @serviceID`;

    const result = await pool
      .request()
      .input("serviceID", db.sql.Int, serviceID)
      .query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching Contract documents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
