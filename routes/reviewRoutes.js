const express = require('express');
const { setTourId, getReviews, getReview, setTourAndUserIds, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect, restrictToRole } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect)

router.get('/', setTourId, getReviews);
router.get('/:id', getReview);

router.post('/', restrictToRole("user"), setTourAndUserIds, createReview);
router.patch('/:id', restrictToRole("admin"), updateReview);
router.delete('/:id', restrictToRole("admin"), deleteReview);

module.exports = router;