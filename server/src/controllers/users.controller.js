const User = require('../models/User.model');

// @route  GET /api/users
// @access Private/ADMIN
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// @route  GET /api/users/:id
// @access Private
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// @route  PUT /api/users/:id
// @access Private (own profile) or ADMIN
const updateUser = async (req, res, next) => {
    try {
        const { name, email, status, role, title, bio, password, currentPassword } = req.body;
        const user = await User.findById(req.params.id).select('+password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Only allow updating own profile or ADMIN updating anyone
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized to update this user');
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.status = status ?? user.status;
        user.title = title ?? user.title;
        user.bio = bio ?? user.bio;

        // Only ADMIN can change roles
        if (req.user.role === 'ADMIN') {
            user.role = role ?? user.role;
        }

        // Password change — verify current password first
        if (password) {
            if (!currentPassword) {
                res.status(400);
                throw new Error('Current password is required to set a new password');
            }
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                res.status(401);
                throw new Error('Current password is incorrect');
            }
            user.password = password; // pre-save hook will hash it
        }

        const updated = await user.save();

        // Extract the JWT token from the Authorization header so we can echo it back
        // (req.user is the DB document — it has no .token field)
        const token = req.headers.authorization?.split(' ')[1] ?? null;

        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            status: updated.status,
            title: updated.title,
            bio: updated.bio,
            token,  // preserve the existing JWT so the client stays logged in
        });
    } catch (err) {
        next(err);
    }
};

// @route  DELETE /api/users/:id
// @access Private/ADMIN
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        await user.deleteOne();
        res.json({ message: 'User removed successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
