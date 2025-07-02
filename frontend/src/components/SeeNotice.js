import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Paper, Typography } from '@mui/material';
import TableViewTemplate from './TableViewTemplate';

const SeeNotice = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, response } = useSelector((state) => state.notice);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                if (!currentUser) {
                    setError("No user data available");
                    setIsLoading(false);
                    return;
                }

        if (currentRole === "Admin") {
                    if (!currentUser._id) {
                        setError("Invalid admin ID");
                        setIsLoading(false);
                        return;
                    }
                    await dispatch(getAllNotices(currentUser._id, "Notice"));
                } else {
                    if (!currentUser.department?._id) {
                        setError("Invalid department ID");
                        setIsLoading(false);
                        return;
                    }
                    await dispatch(getAllNotices(currentUser.department._id, "Notice"));
        }
            } catch (error) {
                console.error("Error fetching notices:", error);
                setError("Error loading notices");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotices();
    }, [dispatch, currentUser, currentRole]);

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Details', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 170 },
    ];

    const noticeRows = noticesList?.map((notice) => {
        if (!notice) return null;
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title || "",
            details: notice.details || "",
            date: dateString,
            id: notice._id || "",
        };
    }).filter(Boolean) || [];

    if (isLoading || loading) {
        return (
            <div style={{ marginTop: '50px', marginRight: '20px' }}>
                <Typography>Loading notices...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ marginTop: '50px', marginRight: '20px' }}>
                <Typography color="error">{error}</Typography>
            </div>
        );
    }

    if (response) {
        return (
            <div style={{ marginTop: '50px', marginRight: '20px' }}>
                <Typography>No Notices to Show Right Now</Typography>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '50px', marginRight: '20px' }}>
            <Typography variant="h4" style={{ marginBottom: '40px' }}>Notices</Typography>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {Array.isArray(noticesList) && noticesList.length > 0 ? (
                            <TableViewTemplate columns={noticeColumns} rows={noticeRows} />
                ) : (
                    <Typography>No notices available</Typography>
                )}
                    </Paper>
        </div>
    );
};

export default SeeNotice;