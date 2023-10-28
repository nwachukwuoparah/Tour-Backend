const User = require("../../models/userModel")
const catchAsync = require("../../utils/catchAsync")

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users
    }
  })
});

exports.getUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This get users route is not Defined"
  })
}

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This create users route is not Defined"
  })
}

exports.updateUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This  update users route is not Defined"
  })
}

exports.deleteUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This  delete users route is not Defined"
  })
}