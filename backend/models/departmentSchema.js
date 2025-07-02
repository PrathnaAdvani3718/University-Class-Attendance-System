const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    adminName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("department", departmentSchema); 