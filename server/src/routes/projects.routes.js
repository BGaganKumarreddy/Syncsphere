const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projects.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', requireRole('ADMIN', 'MEMBER'), deleteProject);

module.exports = router;
