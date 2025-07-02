const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        console.log('Received class data:', req.body);
        
        // Validate required fields
        if (!req.body.sclassName || !req.body.session || !req.body.batch || !req.body.adminID) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            session: req.body.session,
            batch: req.body.batch,
            department: req.body.adminID
        });

        console.log('Creating class with data:', sclass);

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            session: req.body.session,
            batch: req.body.batch,
            department: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class already exists with the same name, session and batch' });
        }
        else {
            const result = await sclass.save();
            console.log('Class created successfully:', result);
            res.send(result);
        }
    } catch (err) {
        console.error('Error creating class:', err);
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        let sclasses = await Sclass.find({ department: req.params.id })
        if (sclasses.length > 0) {
            res.send(sclasses)
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("department", "departmentName")
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getSclassStudents = async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ department: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        const deletedStudents = await Student.deleteMany({ department: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ department: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ department: req.params.id });
        res.send(deletedClasses);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents };