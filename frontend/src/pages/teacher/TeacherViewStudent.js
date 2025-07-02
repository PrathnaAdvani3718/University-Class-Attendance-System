import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Collapse, Table, TableBody, TableHead, Typography } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import { PurpleButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const TeacherViewStudent = () => {

    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch();
    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const address = "Student"
    const studentID = params.id
    const teachSubject = currentUser.teachSubject?.subName
    const teachSubjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    useEffect(() => {
        if (userDetails) {
            console.log("User Details:", userDetails);
            console.log("Attendance Data:", userDetails.attendance);
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    // Debug grouped attendance
    const groupedAttendance = groupAttendanceBySubject(subjectAttendance);
    console.log("Grouped Attendance:", groupedAttendance);

    return (
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
            {loading
                ?
                <>
                    <div>Loading...</div>
                </>
                :
                <div style={{display:'flex', flexDirection:'column' ,justifyContent:'center', alignItems:'center', textAlign:'center', backgroundColor:'#fff', width:'500px', paddingTop:'30px' }}>
                    Name: {userDetails.name}
                    <br />
                    Roll Number: {userDetails.rollNumber}
                    <br />
                    Class: {sclassName.sclassName}
                    <br />
                    School: {studentSchool.schoolName}
                    <br /><br />

                    <h3>Attendance:</h3>
                    {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0
                        &&
                        <>
                            {Object.entries(groupedAttendance).map(([subName, { present, allData, subId, creditHours, subjectType }], index) => {
                                console.log("Rendering Subject:", { subName, creditHours, subjectType });
                                if (subName === teachSubject) {
                                    const totalSessions = creditHours * 15;
                                    const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, totalSessions);
                                    const totalLectures = totalSessions;
                                    const remainingLectures = totalSessions - present;

                                    return (
                                        <Table key={index}>
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableCell>Subject</StyledTableCell>
                                                    <StyledTableCell>Present</StyledTableCell>
                                                    <StyledTableCell>Total Lectures</StyledTableCell>
                                                    <StyledTableCell>Remaining Lectures</StyledTableCell>
                                                    <StyledTableCell>Credit Hours</StyledTableCell>
                                                    <StyledTableCell>Subject Type</StyledTableCell>
                                                    <StyledTableCell>Attendance Percentage</StyledTableCell>
                                                    <StyledTableCell align="center">Actions</StyledTableCell>
                                                </StyledTableRow>
                                            </TableHead>

                                            <TableBody>
                                                <StyledTableRow>
                                                    <StyledTableCell>{subName}</StyledTableCell>
                                                    <StyledTableCell>{present}</StyledTableCell>
                                                    <StyledTableCell>{totalLectures}</StyledTableCell>
                                                    <StyledTableCell>{remainingLectures}</StyledTableCell>
                                                    <StyledTableCell>{creditHours}</StyledTableCell>
                                                    <StyledTableCell>{subjectType}</StyledTableCell>
                                                    <StyledTableCell>{subjectAttendancePercentage}%</StyledTableCell>
                                                    <StyledTableCell align="center">
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleOpen(subId)}
                                                            endIcon={openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                        >
                                                            Details
                                                        </Button>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                                <StyledTableRow>
                                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                        <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                            <Box sx={{ margin: 1 }}>
                                                                <Typography variant="h6" gutterBottom component="div">
                                                                    Attendance Details
                                                                </Typography>
                                                                <Table size="small" aria-label="purchases">
                                                                    <TableHead>
                                                                        <StyledTableRow>
                                                                            <StyledTableCell>Date</StyledTableCell>
                                                                            <StyledTableCell align="right">Status</StyledTableCell>
                                                                        </StyledTableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {allData.map((data, index) => {
                                                                            const date = new Date(data.date);
                                                                            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                                            return (
                                                                                <StyledTableRow key={index}>
                                                                                    <StyledTableCell component="th" scope="row">
                                                                                        {dateString}
                                                                                    </StyledTableCell>
                                                                                    <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                                </StyledTableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>
                                                        </Collapse>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            </TableBody>
                                        </Table>
                                    );
                                }
                                return null;
                            })}
                            <div>
                                Overall Attendance Percentage: {overallAttendancePercentage.toFixed(2)}%
                            </div>

                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                <Typography variant="h6" gutterBottom>
                                    Attendance Summary
                                </Typography>
                                <Typography>
                                    Present: {overallAttendancePercentage.toFixed(2)}%
                                </Typography>
                                <Typography>
                                    Absent: {overallAbsentPercentage.toFixed(2)}%
                                </Typography>
                            </div>
                        </>
                    }
                    <br /><br />
                    <Button
                        variant="contained"
                        onClick={() =>
                            navigate(
                                `/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`
                            )
                        }
                    >
                        Add Attendance
                    </Button>
                    <br /><br /><br />
                    <h3>Subject Marks:</h3>

                    {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 &&
                        <>
                            {subjectMarks.map((result, index) => {
                                if (result.subName.subName === teachSubject) {
                                    return (
                                        <Table key={index}>
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableCell>Subject</StyledTableCell>
                                                    <StyledTableCell>Marks</StyledTableCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                <StyledTableRow>
                                                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                                    <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                                </StyledTableRow>
                                            </TableBody>
                                        </Table>
                                    )
                                }
                                else if (!result.subName || !result.marksObtained) {
                                    return null;
                                }
                                return null
                            })}
                        </>
                    }
                    <PurpleButton variant="contained"
                        onClick={() =>
                            navigate(
                                `/Teacher/class/student/marks/${studentID}/${teachSubjectID}`
                            )}>
                        Add Marks
                    </PurpleButton>
                    <br /><br /><br />
                </div>
            }
        </div>
    )
}

export default TeacherViewStudent