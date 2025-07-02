const TimetableGA = require('../algorithms/timetableGA');
const Resource = require('../models/resourceSchema');
const Subject = require('../models/subjectSchema');
const Teacher = require('../models/teacherSchema');

const generateTimetable = async (req, res) => {
    try {
        const {
            classDetails,
            subjects,
            session,
            constraints
        } = req.body;

        // Get available resources
        const resources = await Resource.find({ status: 'Available' });
        
        // Get teacher information
        const teacherIds = subjects
            .filter(subject => subject.teacher && subject.teacher.id)
            .map(subject => subject.teacher.id);
        
        const teachers = await Teacher.find({ _id: { $in: teacherIds } });
        const teacherMap = teachers.reduce((map, teacher) => {
            map[teacher._id.toString()] = teacher;
            return map;
        }, {});

        // Configure time slots based on session
        const timeSlots = session === 'Morning' ? [
            { startTime: "08:30 AM", endTime: "10:00 AM" },
            { startTime: "10:00 AM", endTime: "11:30 AM" },
            { startTime: "11:30 AM", endTime: "01:00 PM" },
            { startTime: "01:00 PM", endTime: "02:30 PM" },
            { startTime: "02:30 PM", endTime: "04:00 PM" }
        ] : [
            { startTime: "02:30 PM", endTime: "04:00 PM" },
            { startTime: "04:00 PM", endTime: "05:30 PM" },
            { startTime: "05:30 PM", endTime: "07:00 PM" },
            { startTime: "07:00 PM", endTime: "08:30 PM" },
            { startTime: "08:30 PM", endTime: "10:00 PM" }
        ];

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        // Extract teacher preferences
        const teacherPreferences = {};
        subjects.forEach(subject => {
            if (subject.teacher && subject.preferredTimeSlots) {
                teacherPreferences[subject.teacher.id] = subject.preferredTimeSlots;
            }
        });

        // Extract room preferences
        const roomPreferences = {};
        resources.forEach(room => {
            if (room.preferredTimeSlots) {
                roomPreferences[room.roomName] = room.preferredTimeSlots;
            }
        });

        // Configure genetic algorithm
        const gaConfig = {
            populationSize: 100,
            generations: 1000,
            mutationRate: 0.1,
            crossoverRate: 0.8,
            elitismCount: 2,
            subjects,
            resources,
            timeSlots,
            days,
            constraints,
            teacherPreferences,
            roomPreferences,
            teacherMap
        };

        console.log('Starting timetable generation with GA...');
        console.log('Configuration:', {
            subjects: subjects.length,
            resources: resources.length,
            timeSlots: timeSlots.length,
            days: days.length,
            teachers: teachers.length
        });

        // Create and run genetic algorithm
        const ga = new TimetableGA(gaConfig);
        const result = ga.run();

        if (!result) {
            return res.status(400).json({
                status: 'error',
                message: 'Failed to generate timetable'
            });
        }

        console.log('Timetable generated successfully with fitness:', result.fitness);

        // Format the result
        const formattedTimetable = result.timetable.map(daySchedule => ({
            day: daySchedule.day,
            slots: daySchedule.slots.map(slot => {
                // Ensure timeSlot is a string
                const timeSlotStr = typeof slot.timeSlot === 'object' 
                    ? `${slot.timeSlot.startTime} - ${slot.timeSlot.endTime}`
                    : slot.timeSlot;

                // Get teacher information from teacherMap
                const teacher = slot.teacher && slot.teacher.id ? teacherMap[slot.teacher.id] : null;

                return {
                    timeSlot: timeSlotStr,
                    subject: slot.subject ? {
                        subName: slot.subject.subName,
                        subjectType: slot.subject.subjectType,
                        creditHours: slot.subject.creditHours
                    } : null,
                    teacher: teacher ? {
                        id: teacher._id,
                        name: teacher.name,
                        department: teacher.department
                    } : null,
                    room: slot.room ? {
                        roomName: slot.room.roomName,
                        type: slot.room.type,
                        capacity: slot.room.capacity
                    } : null,
                    isEditable: true
                };
            })
        }));

        return res.status(200).json({
            status: 'success',
            message: 'Timetable generated successfully',
            timetable: formattedTimetable,
            fitness: result.fitness
        });

    } catch (error) {
        console.error('Error in generateTimetable:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    generateTimetable
}; 