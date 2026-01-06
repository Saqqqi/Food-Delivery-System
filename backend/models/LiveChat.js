const mongoose = require('mongoose');

const liveChatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function(v) {
                return v === 'anonymous' || 
                       typeof v === 'string' || 
                       mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} is not a valid userId!`
        }
    },
    userName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

const LiveChat = mongoose.model('LiveChat', liveChatMessageSchema);

module.exports = LiveChat;