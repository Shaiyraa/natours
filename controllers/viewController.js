const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === "booking") {
    res.locals.alert = "Your booking was successful! Please, check your email for confirmation. If your booking doesn\'t show here immediately, please, come back later.";
  };

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {

  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: "All tours",
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' });

  if (!tour) return next(new AppError("There is no tour with that name.", 404));

  res.status(200)
    .render('tour', {
      title: tour.name,
      tour
    });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id });
  const tourIds = bookings.map(item => item.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200)
    .render('login', {
      title: "Log in to your account"
    });
});