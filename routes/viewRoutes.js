const express = require('express');
const { alerts, getOverview, getTour, getLoginForm, getAccount, getMyTours } = require('../controllers/viewController');
const { protect, isLoggedIn } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const router = express.Router();

router.use(alerts);

router.get('/me',
  protect,
  getAccount
);

router.get('/my-tours',
  protect,
  getMyTours
);

router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);



module.exports = router;
