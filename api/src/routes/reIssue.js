const express = require("express");
const db = require("../db/sql");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { oldServiceID, newServiceID } = req.body;

    if (!oldServiceID || !newServiceID) {
      return res.status(400).send("Missing service IDs.");
    }

    const pool = await db.connectDB();
    await pool
      .request()
      .input("OldID", db.sql.Int, oldServiceID)
      .input("NewID", db.sql.Int, newServiceID)
      .input("ReissueDate", db.sql.DateTime, new Date()).query(`
        INSERT INTO ServiceReIssue (oldServiceID, newServiceID, Date)
        VALUES (@OldID, @NewID, @ReissueDate)
      `);

    res.status(200).send("Reissue relation saved successfully.");
  } catch (error) {
    console.error("Error in /reIssue:", error);
    res.status(500).send("Failed to log reissue relation.");
  }
});

module.exports = router;
