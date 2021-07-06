const express = require('express');
const { getOverview, getTour, getLoginForm, getAccount, getMyTours } = require('../controllers/viewController');
const { protect, isLoggedIn } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const router = express.Router();

router.get('/me',
  protect,
  getAccount
);

router.get('/my-tours',
  protect,
  getMyTours
);

router.use(isLoggedIn);

router.get('/',
  createBookingCheckout,
  getOverview
);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);



module.exports = router;
