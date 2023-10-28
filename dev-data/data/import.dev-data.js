const mongoose = require("mongoose")
const fs = require("fs")
const Tour = require("../../models/tourModel")
const dotenv = require("dotenv")

dotenv.config({ path: "./config.env" })

const DB = process.env.DATA_BASE.replace('<PASSWORD>', process.env.DATA_BASE_PASSWORD)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"));


// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv)