const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['session', 'message', 'resource', 'profile', 'rating'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity; 