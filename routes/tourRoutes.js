const express = require('express');
const { getTours, aliasTopTours, getTour, createTour, uploadTourImages, resizeTourImages, updateTour, deleteTour, getToursStats, getMonthlyPlan, getToursWithin, getDistances } = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRoutes');
const { protect, restrictToRole } = require('../controllers/authController');

const router = express.Router();
router.use('/:id/reviews', reviewRouter)

router.get('/top-5-cheap',
  aliasTopTours,
  getTours
);
router.get('/stats', getToursStats);
router.get('/monthly-plan/:year',
  protect,
  restrictToRole("admin", "lead-guide", "guide"),
  getMonthlyPlan
);

router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithin)
router.get('/distances/:latlng/uni  t/:unit', getDistances)

router.get('/', getTours);
router.get('/:id', getTour);

router.post('/',
  protect,
  restrictToRole("admin", "lead-guide"),
  createTour
);

router.patch('/:id',
  protect,
  restrictToRole("admin", "lead-guide"),
  uploadTourImages,
  resizeTourImages,
  updateTour
);

router.delete('/:id',
  protect,
  restrictToRole("admin", "lead-guide"),
  deleteTour
);



module.exports = router;
