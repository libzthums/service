const db = require("../db/sql");
const express = require("express");
const router = express.Router();

router.get("/:serviceID", async (req, res) => {
  const { serviceID } = req.params;

  try {
    // Query to fetch documents from ServiceDocument table and sort by DocType
    const query = `
      SELECT DocName, DocPath, DocType
      FROM ServiceDocument
      WHERE serviceID = @serviceID
      ORDER BY DocType ASC
    `;

    const pool = await db.connectDB();
    const request = pool.request();
    request.input("serviceID", db.sql.Int, serviceID);

    const result = await request.query(query);

    // Group documents by DocType
    const groupedDocs = result.recordset.reduce(
      (acc, doc) => {
        if (doc.DocType === "pr") {
          acc.prDocs.push(doc);
        } else if (doc.DocType === "po") {
          acc.poDocs.push(doc);
        } else if (doc.DocType === "contract") {
          acc.contractDocs.push(doc);
        }
        return acc;
      },
      { prDocs: [], poDocs: [], contractDocs: [] }
    );

    const hasPR = groupedDocs.prDocs.length > 0;
    const hasPO = groupedDocs.poDocs.length > 0;
    const hasContract = groupedDocs.contractDocs.length > 0;

    res.json({ ...groupedDocs, hasPR, hasPO, hasContract });
  } catch (error) {
    console.log("Error fetching documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
