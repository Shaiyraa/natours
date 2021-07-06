const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
// const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('./handlerFactory');

exports.setTourId = (req, res, next) => {
  if (req.params.id) req.filter = { tour: req.params.id };
  next();
}
exports.getReviews = getAll(Review);

exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user._id;
  next();
}
exports.getReview = getOne(Review);

exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);