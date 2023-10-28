const { promisify } = require("util")
const User = require("../../models/userModel")
const catchAsync = require("../../utils/catchAsync")
const jwt = require("jsonwebtoken")
const AppError = require("../../utils/appError")
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/sendEmail");

const signToken = (id) => {
  return jwt.sign(
    { id: id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  })

  const token = signToken(newUser._id)

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser
    }
  })
});

exports.logIn = catchAsync(async (req, res, next) => {

  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError("Email and password is required", 404))
  };

  const user = await User.findOne({ email }).select("+password")

  if (!user || (!await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email and password", 401))
  };

  const token = signToken(user._id)

  res.status(200).json({
    status: "success",
    token
  })
});
//CHecks on jwt
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Get token and check if it is there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  };
  if (!token) {
    return next(new AppError("You are not logged in! log in to gain access ", 401))
  };
  //verifidation
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User with this token does not exist.", 401))
  };
  if (await currentUser.changedPassword(decoded.iat)) {
    return next(new AppError("User recently changed password please login in again.", 401))
  };
  // Grant access to the protected route
  req.user = currentUser;
  next()
});
//Autuorization
exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403))
    };
    next()
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on post email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError("User with this email not found", 404))
  }
  const resetToken = user.createPasswordResetToken()

  await user.save({ validateBeforeSave: false })

  //generate a random token and send it as an email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`
  const message = `Forgot your password? send a PATCH request with your new password and password 
  confirm if you did not send this please igmore this email`

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message
    });
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetTokenExperies = undefined;
    await user.save({ validateBeforeSave: false });
    return new AppError(`There was an error sending Email to ${user.email} try again later`, 500)
  };

  res.status(200).json({
    status: "success",
    message: `Reset token has been sent to ${user.email}`
  })
  next()
});

exports.resetPassword = (req, res, next) => {

}