const express = require("express");
const bcrypt = require("bcryptjs");
const { connectDB, sql } = require("../db/sql");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("register"); // Render the register.ejs view
});

// Handle POST request for registering a new user
router.post("/", async (req, res) => {
  const { userName, userPassword } = req.body;

  try {
    // Check if user already exists
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("userName", sql.VarChar(255), userName)
      .query(
        "SELECT COUNT(*) AS count FROM userLogin WHERE userName = @userName"
      );

    if (result.recordset[0].count > 0) {
      return res.render("register", {
        errorMessage: "Email already registered!",
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Insert the new user into the database
    await pool
      .request()
      .input("userName", sql.VarChar(255), userName)
      .input("userPassword", sql.VarChar(255), hashedPassword)
      .query(
        "INSERT INTO userLogin (userName, userPassword) VALUES (@userName, @userPassword)"
      );

    // Registration successful, render page with success message
    res.render("register", {
      successMessage: "Registration successful! Please log in.",
    });
  } catch (err) {
    console.error("Registration failed:", err);
    res.render("register", {
      errorMessage: "Registration error. Please try again later.",
    });
  }
});

module.exports = router;
