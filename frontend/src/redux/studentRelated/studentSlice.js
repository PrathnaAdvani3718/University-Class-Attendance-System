import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    studentsList: [],
    loading: false,
    error: null,
    status: null,
    underControl: false,
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.studentsList = action.payload;
            state.error = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        stuffDone: (state) => {
            state.loading = false;
            state.status = "added";
            state.error = null;
        },
        clearStatus: (state) => {
            state.status = null;
        },
        underStudentControl: (state) => {
            state.underControl = false;
        }
    }
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone,
    clearStatus,
    underStudentControl
} = studentSlice.actions;

export const studentReducer = studentSlice.reducer;
