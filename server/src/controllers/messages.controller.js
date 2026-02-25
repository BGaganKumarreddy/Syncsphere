const Message = require('../models/Message.model');
const mongoose = require('mongoose');

// @route  GET /api/messages/:userId
// @access Private — get all messages between me and :userId (the thread)
const getThread = async (req, res, next) => {
    try {
        const me = req.user._id;
        const other = req.params.userId;

        const messages = await Message.find({
            $or: [
                { from: me, to: other },
                { from: other, to: me },
            ],
        })
            .sort({ createdAt: 1 })
            .populate('from', 'name')
            .populate('to', 'name');

        res.json(messages);
    } catch (err) {
        next(err);
    }
};

// @route  POST /api/messages/:userId
// @access Private — send a message to :userId
const sendMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) {
            res.status(400);
            throw new Error('Message text is required');
        }

        const msg = await Message.create({
            from: req.user._id,
            to: req.params.userId,
            text: text.trim(),
        });

        await msg.populate([
            { path: 'from', select: 'name' },
            { path: 'to', select: 'name' },
        ]);

        res.status(201).json(msg);
    } catch (err) {
        next(err);
    }
};

module.exports = { getThread, sendMessage };
