const mongoose = require("mongoose");

const wasteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },   
    weight: {
        type: Number,
        required: true
    },
    isAi: {
        type: Boolean,
        default: false
    },
    confidence: {
        type: Number,
        default: null
    },
    aiOriginalType: {
        type: String,
        default: null
    },
    image: {
        type: String, 
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Map _id to id in responses
wasteSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Waste", wasteSchema);