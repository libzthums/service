const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { connectDB, sql } = require("../db/sql");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Login route
router.post("/", async (req, res) => {
  const { userName, userPassword } = req.body;

  try {
    const pool = await connectDB();

    // Query to find user by userName
    const query = `SELECT * FROM userLogin WHERE userName = @userName`;

    const request = pool.request();
    request.input("userName", sql.VarChar, userName);

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.recordset[0];

    // Compare the provided password with the stored hashed password using bcrypt
    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userID: user.userID, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "10h" } // Token expiration time (10 hrs.)
    );

    // Send back the token and user data
    res.json({
      token,
      user: {
        id: user.userID,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
