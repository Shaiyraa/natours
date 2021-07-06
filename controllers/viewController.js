const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {

  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: "All tours",
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' })

  if (!tour) return next(new AppError("There is no tour with that name.", 404))
  res.status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*; child-src 'self' https://* blob: data:; connect-src 'self' https://*  wss://*; font-src 'self' https://* blob: data:; img-src 'self' https://* blob: data:; media-src 'self' https://* blob: data:; object-src 'self' https://* blob: data:; script-src 'self' https://* 'unsafe-inline' 'unsafe-eval'; style-src 'self' https://* 'unsafe-inline';"
    )
    .render('tour', {
      title: tour.name,
      tour
    });
})

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id })
  const tourIds = bookings.map(item => item.tour)
  const tours = await Tour.find({ _id: { $in: tourIds } })

  res.status(200).render('overview', {
    title: 'My tours',
    tours
  })
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*; child-src 'self' https://* blob: data:; connect-src *; font-src 'self' https://* blob: data:; img-src 'self' https://* blob: data:; media-src 'self' https://* blob: data:; object-src 'self' https://* blob: data:; script-src 'self' https://* 'unsafe-inline' 'unsafe-eval'; style-src 'self' https://* 'unsafe-inline';"
    )
    .set('Access-Control-Allow-Origin', '*')
    .render('login', {
      title: "Log in to your account"
    });
});