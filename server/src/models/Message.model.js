const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Index for fast thread lookup — get all messages between two users
messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ to: 1, from: 1 });

module.exports = mongoose.model('Message', messageSchema);
