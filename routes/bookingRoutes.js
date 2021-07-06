const express = require('express');
const { getCheckoutSession } = require('../controllers/bookingController');
const { protect, restrictToRole } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);
router.get('/', getAllBookings)
router.post('/', createBooking)
router.patch('/:id', updateBooking)
router.delete('/:id', deleteBooking)
router.get('/:id', getBooking)

router.use(restrictToRole('admin', 'lead-guide'));

module.exports = router;