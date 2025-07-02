const initialState = {
    resources: [],
    resource: null,
    loading: false,
    error: null
};

const resourceReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_RESOURCE':
            return {
                ...state,
                resources: [...state.resources, action.payload],
                loading: false
            };
        case 'GET_DEPARTMENT_RESOURCES':
            return {
                ...state,
                resources: action.payload,
                loading: false
            };
        case 'GET_RESOURCE':
            return {
                ...state,
                resource: action.payload,
                loading: false
            };
        case 'UPDATE_RESOURCE':
            return {
                ...state,
                resources: state.resources.map(resource =>
                    resource._id === action.payload._id ? action.payload : resource
                ),
                resource: action.payload,
                loading: false
            };
        case 'DELETE_RESOURCE':
            return {
                ...state,
                resources: state.resources.filter(resource => resource._id !== action.payload),
                loading: false
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: true
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        default:
            return state;
    }
};

export default resourceReducer; 