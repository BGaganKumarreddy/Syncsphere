const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/users.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect); // all user routes require auth

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', requireRole('ADMIN'), deleteUser);

module.exports = router;
