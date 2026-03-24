const dotenv = require("dotenv");
require("dotenv").config();
const app = require("./app");
const {connectDatabase} = require("./db");

dotenv.config();

connectDatabase();

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});



