const fs = require("fs")
const Tour = require("../../models/tourModel")
const APIFeatures = require("../../utils/apiFeatures")
const catchAsync = require("../../utils/catchAsync")
const AppError = require("../../utils/appError")
const { Expo } = require('expo-server-sdk');
const { log } = require("console")
const expo = new Expo();

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //Excitute
  const featurs = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const tours = await featurs.query
  //RESPONSE
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours
    }
  })
})

exports.getOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
  // Tour.findOne({ _id: req.params.id })
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404))
  }
  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  })
})

exports.pushNotification = catchAsync(async (req, res, next) => {
  // expo push token ExponentPushToken[M56cGsO6ZBhAMLmVna-kOQ] gotten from request body
  const { notificationToken } = req.body
  // Send notification
  const message = {
    to: `${notificationToken}`,
    sound: 'default',
    title: 'New Notification',
    body: 'Tour created sucessfully',
  };

  try {
    const result = await expo.sendPushNotificationsAsync([message]);
    res.status(200).json({
      status: "success",
      data: {
        message: result
      }
    })
  } catch (error) {
    console.error(error);
    return next(new AppError('Error sending push notification:', 500))
  }
})

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404))
  }
  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOneAndDelete(req.params.id)
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404))
  }
  res.status(200).json({
    status: "success",
    data: {
      message: "Tour deleted"
    }
  });
})

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }
    },
    {
      $sort: {
        avgPrice: 1,
      }
    },
    // {
    //   $match:{
    //     _id: { $ne: "EASY" },
    //   }
    // }
  ])

  res.status(201).json({
    status: 'success',
    data: {
      tour: stats
    }
  });
})

exports.getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  console.log(year, new Date(`${year}-01-01`))
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" }
      }
    },
    {
      $addFields: { month: "$_id" }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    }
  ])

  res.status(201).json({
    status: 'success',
    length: plan.length,
    data: {
      tour: plan
    }
  });
})