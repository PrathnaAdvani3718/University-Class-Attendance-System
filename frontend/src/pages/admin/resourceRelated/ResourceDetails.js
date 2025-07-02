import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, updateResource } from '../../../redux/actions/resourceActions';
import { Button, TextField, MenuItem, Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { BlueButton } from '../../../components/buttonStyles';

const predefinedEquipment = [
    'Computers',
    'Projector',
    'Whiteboard',
    'Smart Board',
    'Internet Access',
    'Air Conditioning',
    'Sound System',
    'Microphone',
    'Document Camera',
    'Printer',
    'Scanner',
    'Lab Equipment',
    'Safety Equipment',
    'Furniture',
    'Lighting System'
];

const initialResourceState = {
    roomName: '',
    type: '',
    capacity: '',
    equipment: [{ name: '' }],
    status: 'Available'
};

const ResourceDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const resource = useSelector(state => state.resource.resource);
    const [editMode, setEditMode] = useState(false);
    const [editedResource, setEditedResource] = useState(initialResourceState);

    useEffect(() => {
        dispatch(getResource(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (resource) {
            setEditedResource(resource);
        }
    }, [resource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedResource(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEquipmentChange = (index, value) => {
        const newEquipment = [...editedResource.equipment];
        newEquipment[index].name = value;
        setEditedResource(prev => ({
            ...prev,
            equipment: newEquipment
        }));
    };

    const addEquipmentField = () => {
        setEditedResource(prev => ({
            ...prev,
            equipment: [...prev.equipment, { name: '' }]
        }));
    };

    const removeEquipmentField = (index) => {
        const newEquipment = editedResource.equipment.filter((_, i) => i !== index);
        setEditedResource(prev => ({
            ...prev,
            equipment: newEquipment
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateResource(id, editedResource));
        setEditMode(false);
    };

    if (!editedResource) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Resource Details</Typography>
                <Button
                    variant="contained"
                    onClick={() => setEditMode(!editMode)}
                    sx={BlueButton.primary}
                >
                    {editMode ? 'Cancel' : 'Edit'}
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Room Name"
                                    name="roomName"
                                    value={editedResource.roomName || ''}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Type"
                                    name="type"
                                    value={editedResource.type || ''}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    required
                                >
                                    <MenuItem value="Classroom">Classroom</MenuItem>
                                    <MenuItem value="Laboratory">Laboratory</MenuItem>
                                    <MenuItem value="Conference Room">Conference Room</MenuItem>
                                    <MenuItem value="Auditorium">Auditorium</MenuItem>
                                    <MenuItem value="Computer Lab">Computer Lab</MenuItem>
                                    <MenuItem value="Library">Library</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Capacity"
                                    name="capacity"
                                    type="number"
                                    value={editedResource.capacity || ''}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    name="status"
                                    value={editedResource.status || 'Available'}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    required
                                >
                                    <MenuItem value="Available">Available</MenuItem>
                                    <MenuItem value="Occupied">Occupied</MenuItem>
                                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Equipment
                                </Typography>
                                {editedResource.equipment.map((equip, index) => (
                                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                        <Grid item xs={10}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="Equipment Name"
                                                value={equip.name || ''}
                                                onChange={(e) => handleEquipmentChange(index, e.target.value)}
                                                disabled={!editMode}
                                                required
                                            >
                                                {predefinedEquipment.map((equipment) => (
                                                    <MenuItem key={equipment} value={equipment}>
                                                        {equipment}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        {editMode && (
                                            <Grid item xs={2}>
                                                <BlueButton
                                                    onClick={() => removeEquipmentField(index)}
                                                    disabled={editedResource.equipment.length === 1}
                                                    sx={{ backgroundColor: 'error.main' }}
                                                >
                                                    Remove
                                                </BlueButton>
                                            </Grid>
                                        )}
                                    </Grid>
                                ))}
                                {editMode && (
                                    <BlueButton
                                        onClick={addEquipmentField}
                                        sx={{ mb: 2 }}
                                    >
                                        Add Equipment
                                    </BlueButton>
                                )}
                            </Grid>
                            {editMode && (
                                <Grid item xs={12}>
                                    <BlueButton
                                        type="submit"
                                    >
                                        Save Changes
                                    </BlueButton>
                                </Grid>
                            )}
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResourceDetails; 