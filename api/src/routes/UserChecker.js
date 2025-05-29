const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { connectDB, sql } = require("../db/sql");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { userName, userPassword } = req.body;

  try {
    const pool = await connectDB();

    // Fetch user login data
    const result = await pool
      .request()
      .input("userName", sql.VarChar, userName)
      .query("SELECT * FROM userLogin WHERE userName = @userName");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.recordset[0];

    // Compare the password
    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Fetch user details (Name, Permission, defaultDivision)
    const detailResult = await pool
      .request()
      .input("userID", sql.Int, user.userID)
      .query("SELECT Name, Permission, defaultDivision FROM userDetail WHERE userID = @userID");

    const detail = detailResult.recordset[0];

    // Fetch user divisions and their names
    const divisionResult = await pool
      .request()
      .input("userID", sql.Int, user.userID)
      .query(
        `SELECT d.divisionID, d.divisionName 
         FROM userDivision AS ud
         INNER JOIN Division AS d 
         ON ud.divisionID = d.divisionID
         WHERE ud.userID = @userID`
      );

    const divisionIDs = divisionResult.recordset.map((row) => row.divisionID);
    const divisionNames = divisionResult.recordset.map(
      (row) => row.divisionName
    );

    function getPermissionLabel(code) {
      switch (code) {
        case 1:
          return "User";
        case 2:
          return "Admin";
        default:
          return "Unknown";
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userID: user.userID, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.json({
      token,
      user: {
        id: user.userID,
        userName: user.userName,
        name: detail?.Name,
        permission: getPermissionLabel(detail?.Permission),
        permissionCode: detail?.Permission,
        defaultDivision: detail?.defaultDivision,
        divisionIDs: divisionIDs,
        divisionNames: divisionNames,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
