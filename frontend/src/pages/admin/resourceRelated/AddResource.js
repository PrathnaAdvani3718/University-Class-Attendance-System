import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addResource } from '../../../redux/actions/resourceActions';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    IconButton,
    Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
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

const AddResource = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [resource, setResource] = useState({
        roomName: '',
        type: '',
        capacity: '',
        equipment: [{ name: '' }],
        department: currentUser?._id
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setResource(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEquipmentChange = (index, value) => {
        const newEquipment = [...resource.equipment];
        newEquipment[index].name = value;
        setResource(prev => ({
            ...prev,
            equipment: newEquipment
        }));
    };

    const addEquipmentField = () => {
        setResource(prev => ({
            ...prev,
            equipment: [...prev.equipment, { name: '' }]
        }));
    };

    const removeEquipmentField = (index) => {
        const newEquipment = resource.equipment.filter((_, i) => i !== index);
        setResource(prev => ({
            ...prev,
            equipment: newEquipment
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addResource(resource, navigate));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Add New Resource
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Room Name"
                            name="roomName"
                            value={resource.roomName}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Type"
                            name="type"
                            value={resource.type}
                            onChange={handleChange}
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
                            value={resource.capacity}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Equipment
                        </Typography>
                        {resource.equipment.map((equip, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={10}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Equipment Name"
                                        value={equip.name}
                                        onChange={(e) => handleEquipmentChange(index, e.target.value)}
                                        required
                                    >
                                        {predefinedEquipment.map((equipment) => (
                                            <MenuItem key={equipment} value={equipment}>
                                                {equipment}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={2}>
                                    <BlueButton
                                        onClick={() => removeEquipmentField(index)}
                                        disabled={resource.equipment.length === 1}
                                        sx={{ backgroundColor: 'error.main' }}
                                    >
                                        Remove
                                    </BlueButton>
                                </Grid>
                            </Grid>
                        ))}
                        <BlueButton
                            onClick={addEquipmentField}
                            sx={{ mb: 2 }}
                        >
                            Add Equipment
                        </BlueButton>
                    </Grid>
                    <Grid item xs={12}>
                        <BlueButton
                            type="submit"
                        >
                            Add Resource
                        </BlueButton>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default AddResource; 