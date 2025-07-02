const Resource = require('../models/resourceSchema.js');
const Teacher = require('../models/teacherSchema.js');
const { validationResult } = require('express-validator');

// Create a new resource
const createResource = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { roomName, type, capacity, equipment, department, status } = req.body;
        
        // Check if room name already exists in the department
        const existingResource = await Resource.findOne({ 
            roomName, 
            department 
        });
        
        if (existingResource) {
            return res.status(400).json({ 
                message: 'A resource with this room name already exists in the department' 
            });
        }

        const resource = new Resource({
            roomName,
            type,
            capacity,
            equipment,
            department,
            status: status || 'Available'
        });

        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all resources for a department
const getDepartmentResources = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const resources = await Resource.find({ department: departmentId })
            .sort({ roomName: 1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single resource
const getResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);
        
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a resource
const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomName, type, capacity, equipment, status } = req.body;

        // Check if the new room name already exists in the department
        if (roomName) {
            const existingResource = await Resource.findOne({ 
                roomName, 
                department: req.body.department,
                _id: { $ne: id } // Exclude current resource
            });
            
            if (existingResource) {
                return res.status(400).json({ 
                    message: 'A resource with this room name already exists in the department' 
                });
            }
        }

        const resource = await Resource.findByIdAndUpdate(
            id,
            { roomName, type, capacity, equipment, status },
            { new: true, runValidators: true }
        );

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a resource
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findByIdAndDelete(id);
        
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all resources
const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find()
            .sort({ roomName: 1 });
        res.status(200).json({
            status: 'success',
            resources
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .select('name department')
            .sort({ name: 1 });
        res.status(200).json({
            status: 'success',
            teachers
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

module.exports = {
    createResource,
    getDepartmentResources,
    getResource,
    updateResource,
    deleteResource,
    getAllResources,
    getAllTeachers
}; 