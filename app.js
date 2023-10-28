const express = require("express");
const morgan = require("morgan")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const AppError = require("./utils/appError")
const globalError = require("./controllers/errorController")
const app = express();

app.use(express.json())
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(`${__dirname}/public`))

app.use("/api/v1/users", userRouter)
app.use("/api/v1/tours", tourRouter)

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
})

app.use(globalError)

module.exports = app