const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Classroom', 'Lab'],
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Maintenance', 'Occupied'],
        default: 'Available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema); 