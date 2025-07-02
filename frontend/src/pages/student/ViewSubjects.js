import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { Box, Paper, Table, TableBody, TableContainer, TableHead, Typography, Divider } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const ViewSubjects = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const [subjects, setSubjects] = useState([]);
    const [marks, setMarks] = useState([]);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser?._id]);

    useEffect(() => {
        if (userDetails) {
            setSubjects(userDetails.sclassName?.subjects || []);
            setMarks(userDetails.examResult || []);
        }
    }, [userDetails]);

    if (loading) {
        return <Typography>Loading subjects...</Typography>;
    }

    return (
        <Box sx={{ padding: 3 }}>
            {/* All Subjects Section */}
            <Typography variant="h4" gutterBottom style={{ color: '#080a43', marginBottom: '20px' }}>
                All Subjects
            </Typography>
            <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject Name</StyledTableCell>
                            <StyledTableCell>Subject Code</StyledTableCell>
                            <StyledTableCell>Credit Hours</StyledTableCell>
                            <StyledTableCell>Subject Type</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.map((subject, index) => (
                            <StyledTableRow key={index}>
                                <StyledTableCell>{subject.subName}</StyledTableCell>
                                <StyledTableCell>{subject.subCode}</StyledTableCell>
                                <StyledTableCell>{subject.creditHours}</StyledTableCell>
                                <StyledTableCell>{subject.subjectType}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ my: 4 }} />

            {/* Marks Section */}
            <Typography variant="h4" gutterBottom style={{ color: '#080a43', marginBottom: '20px' }}>
                Subject Marks
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject Name</StyledTableCell>
                            <StyledTableCell>Marks Obtained</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {marks.length > 0 ? (
                            marks.map((mark, index) => (
                                <StyledTableRow key={index}>
                                    <StyledTableCell>{mark.subName?.subName || 'Unknown Subject'}</StyledTableCell>
                                    <StyledTableCell>{mark.marksObtained}</StyledTableCell>
                                </StyledTableRow>
                            ))
                        ) : (
                            <StyledTableRow>
                                <StyledTableCell colSpan={2} align="center">
                                    No marks available yet
                                </StyledTableCell>
                            </StyledTableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ViewSubjects; 