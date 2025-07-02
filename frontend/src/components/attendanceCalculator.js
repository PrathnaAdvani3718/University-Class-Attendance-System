export const calculateSubjectAttendancePercentage = (presentCount, totalSessions) => {
    if (totalSessions === 0 || presentCount === 0) {
        return 0;
    }
    const percentage = (presentCount / totalSessions) * 100;
    return percentage.toFixed(2); // Limit to two decimal places
};

export const groupAttendanceBySubject = (subjectAttendance) => {
    console.log("Input Attendance Data:", subjectAttendance);
    const attendanceBySubject = {};

    subjectAttendance.forEach((attendance) => {
        console.log("Processing Attendance Record:", attendance);
        
        // Check if we have the full subject data
        if (attendance.subName && typeof attendance.subName === 'object') {
            const subName = attendance.subName.subName;
            const creditHours = attendance.subName.creditHours;
            const subId = attendance.subName._id;
            const subjectType = attendance.subName.subjectType;
            const totalLectures = creditHours * 15; // Assuming 15 lectures per credit hour

            console.log("Subject Details from DB:", { 
                subName, 
                creditHours, 
                subId, 
                subjectType,
                totalLectures
            });

            if (!attendanceBySubject[subName]) {
                attendanceBySubject[subName] = {
                    present: 0,
                    absent: 0,
                    creditHours: creditHours,
                    subjectType: subjectType,
                    allData: [],
                    subId: subId,
                    totalLectures: totalLectures,
                    remainingLectures: totalLectures
                };
            }
            if (attendance.status === "Present") {
                attendanceBySubject[subName].present++;
                attendanceBySubject[subName].remainingLectures--;
            } else if (attendance.status === "Absent") {
                attendanceBySubject[subName].absent++;
                attendanceBySubject[subName].remainingLectures--;
            }
            attendanceBySubject[subName].allData.push({
                date: attendance.date,
                status: attendance.status,
            });
        } else {
            console.warn("Invalid subject data in attendance record:", attendance);
        }
    });
    console.log("Grouped Attendance Result:", attendanceBySubject);
    return attendanceBySubject;
}

export const calculateOverallAttendancePercentage = (subjectAttendance) => {
    let totalSessionsSum = 0;
    let presentCountSum = 0;
    const uniqueSubIds = [];

    subjectAttendance.forEach((attendance) => {
        if (attendance.subName && typeof attendance.subName === 'object') {
            const subId = attendance.subName._id;
            if (!uniqueSubIds.includes(subId)) {
                const creditHours = parseInt(attendance.subName.creditHours);
                const sessions = creditHours * 15;
                totalSessionsSum += sessions;
                uniqueSubIds.push(subId);
            }
            presentCountSum += attendance.status === "Present" ? 1 : 0;
        }
    });

    if (totalSessionsSum === 0 || presentCountSum === 0) {
        return 0;
    }

    return (presentCountSum / totalSessionsSum) * 100;
};