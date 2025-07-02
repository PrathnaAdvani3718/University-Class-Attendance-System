import React, { useEffect, useState } from 'react'
import { Container, Grid, Paper, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import Subject from "../../assets/subjects.svg";
import Assignment from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    useEffect(() => {
        if (currentUser && currentUser._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentUser && currentUser.sclassName && currentUser.sclassName._id) {
            dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (userDetails && userDetails.attendance) {
            setSubjectAttendance(userDetails.attendance);
            setIsDataLoaded(true);
        }
    }, [userDetails]);

    useEffect(() => {
        if (currentUser && subjectsList && userDetails) {
            setIsLoading(false);
        }
    }, [currentUser, subjectsList, userDetails]);

    const numberOfSubjects = subjectsList?.length || 0;
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    if (isLoading || !currentUser) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography>Loading student data...</Typography>
            </Container>
        );
    }

    if (!currentUser.sclassName) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography>No class assigned to student.</Typography>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Subject} alt="Subjects" />
                            <Title>
                                Total Subjects
                            </Title>
                            <Data start={0} end={numberOfSubjects} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Assignment} alt="Assignments" />
                            <Title>
                                Total Assignments
                            </Title>
                            <Data start={0} end={15} duration={4} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                        <ChartContainer>
                            {!isDataLoaded ? (
                                <Typography variant="h6">Loading attendance data...</Typography>
                            ) : response ? (
                                <Typography variant="h6">No Attendance Found</Typography>
                            ) : loading ? (
                                <Typography variant="h6">Loading...</Typography>
                            ) : subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Overall Attendance
                                    </Typography>
                                    <Data start={0} end={overallAttendancePercentage} duration={2.5} suffix="%" />
                                </>
                            ) : (
                                <Typography variant="h6">No Attendance Found</Typography>
                            )}
                        </ChartContainer>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

const ChartContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-direction: column;
  height: 240px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
  color:#080A43;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: #080A43;
`;

export default StudentHomePage;