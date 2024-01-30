const mongoose = require("mongoose")
const dotenv = require("dotenv")
const app = require("./app")

process.on("uncaughtException", err => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION!");
  process.exit(1);
});

dotenv.config({ path: "./config.env" })

const DB = process.env.DATA_BASE.replace('<PASSWORD>', process.env.DATA_BASE_PASSWORD)

console.log(DB)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION!");
  server.close(() => {
    process.exit(1);
  })
});
