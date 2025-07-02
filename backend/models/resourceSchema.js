const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Classroom', 'Laboratory', 'Conference Room', 'Auditorium', 'Computer Lab', 'Library']
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    equipment: [{
        name: {
            type: String,
            required: true,
            enum: [
                'Computers',
                'Projector',
                'Whiteboard',
                'Smart Board',
                'Internet Access',
                'Air Conditioning',
                'Sound System',
                'Microphone',
                'Document Camera',
                'Printer',
                'Scanner',
                'Lab Equipment',
                'Safety Equipment',
                'Furniture',
                'Lighting System'
            ]
        }
    }],
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema); 