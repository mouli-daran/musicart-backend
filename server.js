const app = require("./index");
const dotenv = require("dotenv").config();
const connectWithDb = require("./config/db");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 4000;
connectWithDb();

//health api
app.get("/health", (req, res) => {
  res.status(200);
  res.status(200).send("<h1>Health Success</h1>");
});

//home api
app.get("/", (req, res) => {
  res.status(200).send("<h1>Home</h1>");
});

app.listen(4000, (req, res) => {
  console.log(`Server listening on Port ${PORT}`);
});
