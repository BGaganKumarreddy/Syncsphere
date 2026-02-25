const Project = require('../models/Project.model');

// @route  GET /api/projects
// @access Private
const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find()
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        next(err);
    }
};

// @route  GET /api/projects/:id
// @access Private
const getProjectById = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner', 'name email');
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }
        res.json(project);
    } catch (err) {
        next(err);
    }
};

// @route  POST /api/projects
// @access Private
const createProject = async (req, res, next) => {
    try {
        const { name, description, status, dueDate } = req.body;
        if (!name) {
            res.status(400);
            throw new Error('Project name is required');
        }

        const project = await Project.create({
            name,
            description,
            status,
            dueDate,
            owner: req.user._id,
        });

        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
};

// @route  PUT /api/projects/:id
// @access Private
const updateProject = async (req, res, next) => {
    try {
        const { name, description, status, dueDate } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        project.name = name ?? project.name;
        project.description = description ?? project.description;
        project.status = status ?? project.status;
        project.dueDate = dueDate ?? project.dueDate;

        const updated = await project.save();
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// @route  DELETE /api/projects/:id
// @access Private/ADMIN
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }
        await project.deleteOne();
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
