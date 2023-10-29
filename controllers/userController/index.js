const User = require("../../models/userModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync")

const filterObj = (obj, ...fields) => {

  let nweObj = {};
  Object.keys(obj).forEach(el => {
    if (fields.includes(el)) {
      nweObj[el] = obj[el];
    };
  });
  return nweObj;
};

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

exports.updateMe = catchAsync(async (req, res, next) => {

  // Create err if user POST password data
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError("This routh is not for password update please use /updatePassword", 400))
  }

  const filteredBody = filterObj(req.body, "name", "email");

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody,
    { new: true, runValidator: true }
  );

  res.status(200).json({
    status: "suscess",
    message: "User updated",
    data: {
      user: updateUser
    }
  })
});



exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: "success",
    message: "user Deleted",
    data: null
  });
})

exports.updateUsers = catchAsync(async (req, res, next) => {


  res.status(200).json({
    status: "error",
    message: "This  update users route is not Defined"
  });
});