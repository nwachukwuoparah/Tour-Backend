const express = require("express")
const {
  signUp,
  logIn,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  restrictTo
  pointTransfer
} = require("../../controllers/authController")

const {
  getAllUsers,
  getUsers,
  updateUsers,
  deleteUsers,
  updateMe,
  deleteMe
} = require("../../controllers/userController")

const router = express.Router()

router.post("/signup", signUp)
router.post("/login", logIn)
router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)
router.patch("/referral-point/transfer-point", pointTransfer)
router.patch("/updatePassword", protect, updatePassword)
router.patch("/updateMe", protect, updateMe)
router.delete("/deleteMe", protect, deleteMe)

router
  .route("/")
  .get(getAllUsers)

router
  .route("/:id")
  .get(getUsers)
  .patch(updateUsers)

module.exports = router;