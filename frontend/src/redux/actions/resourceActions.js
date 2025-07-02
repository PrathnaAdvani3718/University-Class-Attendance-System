import axios from '../../axios';
import { toast } from 'react-toastify';

export const addResource = (resource, navigate) => async (dispatch) => {
    try {
        const res = await axios.post('/resources/create', resource);
        dispatch({ type: 'ADD_RESOURCE', payload: res.data });
        toast.success('Resource added successfully');
        navigate('/Admin/resources');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error adding resource');
    }
};

export const getDepartmentResources = (departmentId) => async (dispatch) => {
    try {
        const res = await axios.get(`/resources/department/${departmentId}`);
        dispatch({ type: 'GET_DEPARTMENT_RESOURCES', payload: res.data });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching resources');
    }
};

export const getResource = (id) => async (dispatch) => {
    try {
        const res = await axios.get(`/resources/${id}`);
        dispatch({ type: 'GET_RESOURCE', payload: res.data });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching resource');
    }
};

export const updateResource = (id, resource) => async (dispatch) => {
    try {
        const res = await axios.put(`/resources/${id}`, resource);
        dispatch({ type: 'UPDATE_RESOURCE', payload: res.data });
        toast.success('Resource updated successfully');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error updating resource');
    }
};

export const deleteResource = (id) => async (dispatch) => {
    try {
        await axios.delete(`/resources/${id}`);
        dispatch({ type: 'DELETE_RESOURCE', payload: id });
        toast.success('Resource deleted successfully');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting resource');
    }
}; 