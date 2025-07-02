import {
    GET_SUBJECTS,
    GET_SUBJECT,
    ADD_SUBJECT,
    UPDATE_SUBJECT,
    DELETE_SUBJECT,
    SUBJECT_LOADING,
    SUBJECT_ERROR
} from './subjectTypes';

const initialState = {
    subjectsList: [],
    currentSubject: null,
    loading: false,
    error: null
};

const subjectReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SUBJECTS:
            return {
                ...state,
                subjectsList: action.payload,
                loading: false,
                error: null
            };
        case GET_SUBJECT:
            return {
                ...state,
                currentSubject: action.payload,
                loading: false,
                error: null
            };
        case ADD_SUBJECT:
            return {
                ...state,
                subjectsList: [...state.subjectsList, action.payload],
                loading: false,
                error: null
            };
        case UPDATE_SUBJECT:
            return {
                ...state,
                subjectsList: state.subjectsList.map(subject =>
                    subject._id === action.payload._id ? action.payload : subject
                ),
                loading: false,
                error: null
            };
        case DELETE_SUBJECT:
            return {
                ...state,
                subjectsList: state.subjectsList.filter(subject =>
                    subject._id !== action.payload
                ),
                loading: false,
                error: null
            };
        case SUBJECT_LOADING:
            return {
                ...state,
                loading: true,
                error: null
            };
        case SUBJECT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};

export default subjectReducer; 