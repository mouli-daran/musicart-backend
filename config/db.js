const mongoose = require("mongoose");

const connectWithDb = () => {
  mongoose
    .connect(process.env.DB_URL, {})
    .then(console.log(`Database Connected`))
    .catch((error) => {
      console.log(`Database not connected: ${error}`);
      process.exit(1);
    });
};

module.exports = connectWithDb;
