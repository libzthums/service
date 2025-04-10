const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4005;
const cors = require("cors");
const path = require("path");

const service = require("./src/routes/service");
const docloader = require("./src/routes/DocUploader");
const docreader = require("./src/routes/DocReader");
const login = require("./src/routes/UserChecker");
const registerroute = require("./src/routes/register");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
    "multipart/form-data"
  );
  next();
});

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static("public"));

// Use the data route
app.use("/api/service", service);
app.use("/api/docloader", docloader);
app.use("/api/docreader", docreader);
app.use("/api/login", login);
app.use("/register", registerroute);
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
