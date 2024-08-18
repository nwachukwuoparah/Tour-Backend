const express = require("express")

const { protect, restrictTo } = require("../../controllers/authController")
const {
  createTour,
  getAllTours,
  getOneTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMontlyPlan,
  pushNotification
} = require("../../controllers/tourController")



const router = express.Router()
// router.param("id", checkID)

router.route("/push-notification")
  .post(pushNotification)

router.route("/monthly-plan/:year")
  .get(getMontlyPlan)

router.route("/tour-stats")
  .get(getTourStats)

router.route("/top5-cheap")
  .get(aliasTopTours, getAllTours)

router
  .route("/")
  .get(protect, getAllTours)
  .post(createTour)

router
  .route("/:id")
  .get(getOneTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour)






module.exports = router;