const express = require("express");
const router = express.Router();
const { connectAndQuery, connectDB } = require("../db/sql");

router.get("/", async (req, res) => {
  try {
    // Query to fetch user details and their divisions
    const userQuery = `
      SELECT 
        ud.userID,
        ud.Name, 
        ud.Permission, 
        udv.divisionID
      FROM 
        userDetail ud
      INNER JOIN 
        userDivision udv
      ON 
        ud.userID = udv.userID
    `;

    // Query to fetch all divisions
    const divisionQuery = `
      SELECT 
        divisionID, 
        divisionName 
      FROM 
        Division
    `;

    // Execute both queries
    const userResult = await connectAndQuery(userQuery);
    const divisionResult = await connectAndQuery(divisionQuery);

    // Map division names to division IDs
    const divisionsMap = divisionResult.reduce((map, division) => {
      map[division.divisionID] = division.divisionName;
      return map;
    }, {});

    // Group divisions for each user
    const usersMap = {};
    userResult.forEach((user) => {
      if (!usersMap[user.userID]) {
        usersMap[user.userID] = {
          userID: user.userID,
          Name: user.Name,
          Permission: user.Permission,
          divisions: [],
        };
      }
      usersMap[user.userID].divisions.push({
        divisionID: user.divisionID,
        divisionName: divisionsMap[user.divisionID] || null,
      });
    });

    // Convert the users map to an array
    const users = Object.values(usersMap);

    // Send the users and all divisions as a response
    res.json({ users, divisions: divisionResult });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.post("/addDivision", async (req, res) => {
  const { userID, divisionID } = req.body;

  if (!userID || !divisionID) {
    return res.status(400).send("Missing userID or divisionID");
  }

  try {
    // Query to add the division to the userDivision table
    const query = `
      INSERT INTO userDivision (userID, divisionID)
      VALUES (@userID, @divisionID)
    `;

    const pool = await connectDB();
    await pool
      .request()
      .input("userID", userID)
      .input("divisionID", divisionID)
      .query(query);

    res.status(200).send("Division added to user successfully");
  } catch (error) {
    console.error("Error adding division to user:", error);
    res.status(500).send("Error adding division to user");
  }
});

router.post("/updatePermission", async (req, res) => {
  const { userID, permission } = req.body;

  if (!userID || !permission) {
    return res.status(400).send("Missing userID or permission");
  }

  try {
    const query = `
      UPDATE userDetail
      SET Permission = @permission
      WHERE userID = @userID
    `;

    const pool = await connectDB();
    await pool
      .request()
      .input("userID", userID)
      .input("permission", permission)
      .query(query);

    res.status(200).send("Permission updated successfully");
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).send("Error updating permission");
  }
});

module.exports = router;
