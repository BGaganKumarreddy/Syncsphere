const Task = require('../models/Task.model');

// @route  GET /api/tasks
// @access Private
// Optional query: ?project_id=<id>
const getTasks = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.project_id) filter.project = req.query.project_id;

        const tasks = await Task.find(filter)
            .populate('project', 'name status')
            .populate('assignee', 'name email role')
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        next(err);
    }
};

// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name status')
            .populate('assignee', 'name email role')
            .populate('createdBy', 'name email role');

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        res.json(task);
    } catch (err) {
        next(err);
    }
};

// @route  POST /api/tasks
// @access Private — only ADMIN can assign to someone else
const createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, project, assignee, dueDate } = req.body;

        if (!title) {
            res.status(400);
            throw new Error('Task title is required');
        }

        // Only ADMIN can assign tasks to other users
        let resolvedAssignee = null;
        if (assignee) {
            if (req.user.role !== 'ADMIN') {
                res.status(403);
                throw new Error('Only admins can assign tasks to other users');
            }
            resolvedAssignee = assignee;
        }

        const task = await Task.create({
            title,
            description,
            status: status || 'Todo',
            priority: priority || 'Medium',
            project: project || null,
            assignee: resolvedAssignee,
            dueDate: dueDate || null,
            createdBy: req.user._id,
        });

        const populated = await task.populate([
            { path: 'assignee', select: 'name email role' },
            { path: 'createdBy', select: 'name email role' },
            { path: 'project', select: 'name status' },
        ]);

        res.status(201).json(populated);
    } catch (err) {
        next(err);
    }
};

// @route  PUT /api/tasks/:id
// @access Private
//   - ADMIN: can edit everything (title, description, status, priority, assignee, dueDate)
//   - MEMBER: can only update status/priority on tasks assigned to them
//   - GUEST: read-only, cannot update
const updateTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, project, assignee, dueDate } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const isAdmin = req.user.role === 'ADMIN';
        const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

        // GUEST cannot edit anything
        if (req.user.role === 'GUEST') {
            res.status(403);
            throw new Error('Guests cannot edit tasks');
        }

        // MEMBER can only update their own assigned task's status/priority
        if (!isAdmin) {
            if (!isAssignee) {
                res.status(403);
                throw new Error('You can only update tasks assigned to you');
            }
            // MEMBER cannot re-assign the task
            if (assignee !== undefined && assignee !== null) {
                res.status(403);
                throw new Error('Only admins can reassign tasks');
            }
            // MEMBER can only change status and priority
            task.status = status ?? task.status;
            task.priority = priority ?? task.priority;
        } else {
            // ADMIN can change everything
            task.title = title ?? task.title;
            task.description = description ?? task.description;
            task.status = status ?? task.status;
            task.priority = priority ?? task.priority;
            task.project = project ?? task.project;
            task.assignee = assignee !== undefined ? (assignee || null) : task.assignee;
            task.dueDate = dueDate ?? task.dueDate;
        }

        const updated = await task.save();
        await updated.populate([
            { path: 'assignee', select: 'name email role' },
            { path: 'createdBy', select: 'name email role' },
            { path: 'project', select: 'name status' },
        ]);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// @route  DELETE /api/tasks/:id
// @access Private/ADMIN only
const deleteTask = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Only admins can delete tasks');
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
