import axios from 'axios';
import {
    GET_SUBJECTS,
    GET_SUBJECT,
    ADD_SUBJECT,
    UPDATE_SUBJECT,
    DELETE_SUBJECT,
    SUBJECT_LOADING,
    SUBJECT_ERROR
} from './subjectTypes';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getAllSubjects = (classId) => async (dispatch) => {
    try {
        console.log('Fetching subjects for class ID:', classId);
        dispatch({ type: SUBJECT_LOADING });
        const response = await api.get(`/ClassSubjects/${classId}`);
        console.log('Subjects API Response:', response.data);
        if (response.data && response.data.length > 0) {
            dispatch({ type: GET_SUBJECTS, payload: response.data });
        } else {
            console.log('No subjects found for this class');
            dispatch({ type: GET_SUBJECTS, payload: [] });
        }
    } catch (error) {
        console.error('Error fetching subjects:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        dispatch({
            type: SUBJECT_ERROR,
            payload: error.response?.data?.message || error.message
        });
    }
};

export const getSubject = (subjectId) => async (dispatch) => {
    try {
        dispatch({ type: SUBJECT_LOADING });
        const response = await api.get(`/Subject/${subjectId}`);
        dispatch({ type: GET_SUBJECT, payload: response.data });
    } catch (error) {
        dispatch({
            type: SUBJECT_ERROR,
            payload: error.response?.data?.message || error.message
        });
    }
};

export const addSubject = (subjectData) => async (dispatch) => {
    try {
        dispatch({ type: SUBJECT_LOADING });
        const response = await api.post('/SubjectCreate', subjectData);
        dispatch({ type: ADD_SUBJECT, payload: response.data });
    } catch (error) {
        dispatch({
            type: SUBJECT_ERROR,
            payload: error.response?.data?.message || error.message
        });
    }
};

export const updateSubject = (subjectId, subjectData) => async (dispatch) => {
    try {
        dispatch({ type: SUBJECT_LOADING });
        const response = await api.put(`/Subject/${subjectId}`, subjectData);
        dispatch({ type: UPDATE_SUBJECT, payload: response.data });
    } catch (error) {
        dispatch({
            type: SUBJECT_ERROR,
            payload: error.response?.data?.message || error.message
        });
    }
};

export const deleteSubject = (subjectId) => async (dispatch) => {
    try {
        dispatch({ type: SUBJECT_LOADING });
        await api.delete(`/Subject/${subjectId}`);
        dispatch({ type: DELETE_SUBJECT, payload: subjectId });
    } catch (error) {
        dispatch({
            type: SUBJECT_ERROR,
            payload: error.response?.data?.message || error.message
        });
    }
}; 