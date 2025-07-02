import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import subjectReducer from './subjectRelated/subjectReducer';
import { noticeReducer } from './noticeRelated/noticeSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        teacher: teacherReducer,
        sclass: sclassReducer,
        subject: subjectReducer,
        notice: noticeReducer
    }
});

export default store;
