const express = require("express")
const { signUp, logIn, resetPassword, forgotPassword } = require("../../controllers/authController")
const {
  createUsers,
  getAllUsers,
  getUsers,
  updateUsers,
  deleteUsers
} = require("../../controllers/userController")

const router = express.Router()


router.post("/signup", signUp)
router.post("/login", logIn)

router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)

router
  .route("/")
  .get(getAllUsers)

router
  .route("/:id")
  .get(getUsers)
  .patch(updateUsers)
  .delete(deleteUsers)

module.exports = router;