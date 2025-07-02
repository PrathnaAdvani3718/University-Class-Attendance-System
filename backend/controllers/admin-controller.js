const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');

// const adminRegister = async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(req.body.password, salt);

//         const admin = new Admin({
//             ...req.body,
//             password: hashedPass
//         });

//         const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
//         const existingDepartment = await Admin.findOne({ departmentName: req.body.departmentName });

//         if (existingAdminByEmail) {
//             res.send({ message: 'Email already exists' });
//         }
//         else if (existingDepartment) {
//             res.send({ message: 'Department name already exists' });
//         }
//         else {
//             let result = await admin.save();
//             result.password = undefined;
//             res.send(result);
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// const adminLogIn = async (req, res) => {
//     if (req.body.email && req.body.password) {
//         let admin = await Admin.findOne({ email: req.body.email });
//         if (admin) {
//             const validated = await bcrypt.compare(req.body.password, admin.password);
//             if (validated) {
//                 admin.password = undefined;
//                 res.send(admin);
//             } else {
//                 res.send({ message: "Invalid password" });
//             }
//         } else {
//             res.send({ message: "User not found" });
//         }
//     } else {
//         res.send({ message: "Email and password are required" });
//     }
// };

const adminRegister = async (req, res) => {
    try {
        console.log('Received registration request:', req.body);

        // Validate required fields
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.departmentName) {
            console.log('Missing required fields:', {
                name: !req.body.name,
                email: !req.body.email,
                password: !req.body.password,
                departmentName: !req.body.departmentName
            });
            return res.status(400).json({ 
                message: 'Missing required fields',
                missing: {
                    name: !req.body.name,
                    email: !req.body.email,
                    password: !req.body.password,
                    departmentName: !req.body.departmentName
                }
            });
        }

        // Check for existing admin
        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        if (existingAdminByEmail) {
            console.log('Email already exists:', req.body.email);
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingDepartment = await Admin.findOne({ departmentName: req.body.departmentName });
        if (existingDepartment) {
            console.log('Department already exists:', req.body.departmentName);
            return res.status(400).json({ message: 'Department name already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Create new admin
        const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass,
            role: req.body.role || "Admin",
            departmentName: req.body.departmentName
        });

        // Save admin
        const result = await admin.save();
            result.password = undefined;
        console.log('Admin registered successfully:', result);
        return res.status(201).json(result);
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            const validated = await bcrypt.compare(req.body.password, admin.password);
            if (validated) {
                admin.password = undefined;
                res.send(admin);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// const deleteAdmin = async (req, res) => {
//     try {
//         const result = await Admin.findByIdAndDelete(req.params.id)

//         await Sclass.deleteMany({ department: req.params.id });
//         await Student.deleteMany({ department: req.params.id });
//         await Teacher.deleteMany({ department: req.params.id });
//         await Subject.deleteMany({ department: req.params.id });
//         await Notice.deleteMany({ department: req.params.id });
//         await Complain.deleteMany({ department: req.params.id });

//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// const updateAdmin = async (req, res) => {
//     try {
//         if (req.body.password) {
//             const salt = await bcrypt.genSalt(10)
//             res.body.password = await bcrypt.hash(res.body.password, salt)
//         }
//         let result = await Admin.findByIdAndUpdate(req.params.id,
//             { $set: req.body },
//             { new: true })

//         result.password = undefined;
//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// module.exports = { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin };

module.exports = { adminRegister, adminLogIn, getAdminDetail };
