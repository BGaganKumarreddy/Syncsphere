const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
} = require('../controllers/teams.controller');

router.use(protect); // all team routes require authentication

router.route('/')
    .get(getTeams)
    .post(createTeam);

router.route('/:id')
    .get(getTeamById)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;
