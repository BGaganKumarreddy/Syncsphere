const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/tasks.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getTasks);         // supports ?project_id= query
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
