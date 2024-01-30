const mongoose = require("mongoose")
const slugify = require("slugify")
const validator = require("validator")


const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must have less or eaual to 40 charaters"],
    minlength: [10, "A tour name must have more or eaual to 10 charaters"],
  },
  slug: {
    type: String,
  },
  duration: {
    type: String,
    required: [true, "A tour must have a duration"]
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have difficulty"],
    enum: {
      values: ["easy", "difficult", "medium"],
      message: "Difficulty is only easy, difficult or medium"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [1, "Rating must be above 1"],
    max: [5, "Rating must be below 5"],
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // to works on only create and not update
        return val < this.price
      },
      message: "Discount price ({VALUE}) should be below the regular price"
    }
  },
  summary: {
    type: String,
    required: [true, "A tour must have a description"],
    trim: true
  },
  description: {
    type: String,
    // trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

tourSchema.virtual("durationweeks").get(function () {
  return `${this.duration / 7} weeks`
})

//DOCUMENT MIDDLEWARE : rund before and on .create()

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true })
  next();
})

// tourSchema.pre("save", function (next) {
//   console.log("will save document")
//   next();
// })
// tourSchema.post("save", function (doc, next) {
//   console.log(doc)
//   next();
// })

//QUERY MIDDLE WARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start = Date.now()
  next();
})

tourSchema.post(/^find/, function (docs, next) {
  // console.log(`Query took ${Date.now() - this.start}, ms`)
  next();
})

//AGGERATION MIDDLE WARE

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;