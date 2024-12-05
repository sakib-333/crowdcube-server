const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Assaigment 10</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
