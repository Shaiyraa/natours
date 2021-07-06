const express = require('express');
const { getUsers, getMe, uploadUserPhoto, resizeUserPhoto, updateMe, deleteMe, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { signUp, logIn, logOut, protect, restrictToRole, forgotPassword, resetPassword, updateMyPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/logout', logOut);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// protect all the routes below
router.use(protect)

router.patch('/update-my-password', updateMyPassword);
router.get('/me', getMe, getUser);
router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/delete-me', deleteMe);

// routes below restricted to admin role
router.use(restrictToRole("admin"))

router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;