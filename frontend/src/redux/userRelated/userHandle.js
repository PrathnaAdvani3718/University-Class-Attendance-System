import axios from 'axios';


import {
  authRequest,
  stuffAdded,
  authSuccess,
  authFailed,
  authError,
  authLogout,
  doneSuccess,
  getDeleteSuccess,
  getRequest,
  getFailed,
  getError,
} from './userSlice';
const REACT_APP_BASE_URL = "http://localhost:8000";


export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        // Convert rollNum to rollNumber if it exists
        if (role === 'Student' && fields.rollNum) {
            fields.rollNumber = fields.rollNum;
            delete fields.rollNum;
        }
        
        const result = await axios.post(`${REACT_APP_BASE_URL}/${role}Login`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        console.log('Registering user with fields:', fields);
        const result = await axios.post(`${REACT_APP_BASE_URL}/${role}Reg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        console.log('Registration response:', result.data);
        
        if (result.data && result.data._id) {
            if (role === 'Admin') {
            dispatch(authSuccess(result.data));
            } else {
                dispatch(stuffAdded(result.data));
        }
        } else if (result.data && result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(authFailed('Registration failed. Please try again.'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            dispatch(authFailed(error.response.data.message || 'Registration failed'));
        } else if (error.request) {
            console.error('No response received:', error.request);
            dispatch(authFailed('No response from server'));
        } else {
            console.error('Error setting up request:', error.message);
            dispatch(authFailed('Error setting up registration request'));
        }
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(getDeleteSuccess());
            return result.data;
        } else {
            dispatch(getFailed("Failed to delete"));
            throw new Error("Failed to delete");
        }
    } catch (error) {
        console.error("Delete error:", error);
        dispatch(getError(error));
        throw error;
    }
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        console.log('Sending data to backend:', fields);
        const endpoint = address === 'Sclass' ? '/SclassCreate' : `/${address}Create`;
        const result = await axios.post(`${REACT_APP_BASE_URL}${endpoint}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Backend response:', result.data);

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        console.error('Error in addStuff:', error.response?.data || error);
        // Handle the error properly to avoid non-serializable values
        const errorMessage = error.response?.data?.message || 'Network Error';
        dispatch(authFailed(errorMessage));
    }
};