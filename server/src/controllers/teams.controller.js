const Team = require('../models/Team.model');

// ── Populate helper ──────────────────────────────────────────────────────────
const populate = (query) =>
    query
        .populate('members', 'name email role')
        .populate('createdBy', 'name email role');

// @route  GET /api/teams
// @access Private
const getTeams = async (req, res, next) => {
    try {
        const teams = await populate(Team.find()).sort({ createdAt: -1 });
        res.json(teams);
    } catch (err) {
        next(err);
    }
};

// @route  GET /api/teams/:id
// @access Private
const getTeamById = async (req, res, next) => {
    try {
        const team = await populate(Team.findById(req.params.id));
        if (!team) {
            res.status(404);
            throw new Error('Team not found');
        }
        res.json(team);
    } catch (err) {
        next(err);
    }
};

// @route  POST /api/teams
// @access Private / ADMIN only
const createTeam = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Only admins can create teams');
        }

        const { name, description, members } = req.body;
        if (!name) {
            res.status(400);
            throw new Error('Team name is required');
        }

        const team = await Team.create({
            name,
            description: description || '',
            members: members || [],
            createdBy: req.user._id,
        });

        res.status(201).json(await populate(Team.findById(team._id)));
    } catch (err) {
        next(err);
    }
};

// @route  PUT /api/teams/:id
// @access Private / ADMIN only
const updateTeam = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Only admins can update teams');
        }

        const { name, description, members } = req.body;
        const team = await Team.findById(req.params.id);
        if (!team) {
            res.status(404);
            throw new Error('Team not found');
        }

        if (name !== undefined) team.name = name;
        if (description !== undefined) team.description = description;
        if (members !== undefined) team.members = members;

        await team.save();
        res.json(await populate(Team.findById(team._id)));
    } catch (err) {
        next(err);
    }
};

// @route  DELETE /api/teams/:id
// @access Private / ADMIN only
const deleteTeam = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Only admins can delete teams');
        }

        const team = await Team.findById(req.params.id);
        if (!team) {
            res.status(404);
            throw new Error('Team not found');
        }

        await team.deleteOne();
        res.json({ message: 'Team deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getTeams, getTeamById, createTeam, updateTeam, deleteTeam };
