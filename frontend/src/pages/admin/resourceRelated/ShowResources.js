import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getDepartmentResources, deleteResource } from '../../../redux/actions/resourceActions';
import {
    Box,
    Typography,
    Grid,
} from '@mui/material';
import { BlueButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';

const ShowResources = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const resources = useSelector((state) => state.resource.resources);

    useEffect(() => {
        if (currentUser) {
            dispatch(getDepartmentResources(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const handleDelete = (id) => {
        dispatch(deleteResource(id));
    };

    const handleView = (id) => {
        navigate(`/Admin/resources/${id}`);
    };

    const ButtonHaver = ({ row }) => (
        <Box>
            <BlueButton
                onClick={() => handleView(row._id)}
                sx={{ mr: 1 }}
            >
                View
            </BlueButton>
            <BlueButton
                onClick={() => handleDelete(row._id)}
                sx={{ backgroundColor: 'error.main' }}
            >
                Delete
            </BlueButton>
        </Box>
    );

    const columns = [
        { id: 'roomName', label: 'Room Name', minWidth: 150 },
        { id: 'type', label: 'Type', minWidth: 150 },
        { id: 'capacity', label: 'Capacity', minWidth: 120 },
        { id: 'status', label: 'Status', minWidth: 120 },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Resources</Typography>
                <BlueButton
                    onClick={() => navigate('/Admin/addresource')}
                >
                    Add Resource
                </BlueButton>
            </Box>
            <TableTemplate
                buttonHaver={ButtonHaver}
                columns={columns}
                rows={resources}
            />
        </Box>
    );
};

export default ShowResources; 