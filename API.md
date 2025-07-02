API Documentation - University Class and Attendance System

Base URL

http://localhost:8000/api

Authentication APIs

POST `/auth/login`

- **Description**: Logs in a user (Admin, Teacher, or Student)
- **Request Body**:

{
  "email": "user@example.com",
  "password": "123456"
}

- **Response**:

{
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "role": "admin | teacher | student"
  }
}

Admin APIs

POST `/admin/create-user`

- **Description**: Create student or teacher accounts
- **Request Body**:

{
  "name": "Aqsa",
  "email": "aqsa@example.com",
  "role": "teacher",
  "password": "pass123"
}

POST `/admin/create-subject`

- **Description**: Create a new subject
- **Request Body**:

{
  "subjectName": "Mathematics",
  "subjectCode": "MATH101"
}

POST `/admin/assign-class`

- **Description**: Assign teacher to subject & class
- **Request Body**:

{
  "teacherId": "teacher_id",
  "classId": "class_id",
  "subjectId": "subject_id"
}
```

POST `/admin/create-notice`

- **Description**: Publish a notice to students/teachers
- **Request Body**:

{
  "title": "Holiday Notice",
  "description": "No classes on Friday",
  "targetRole": "student"
}


Teacher APIs

GET `/teacher/timetable`

- **Description**: Get teacher’s timetable
- Headers:

Authorization: Bearer <token>


POST `/teacher/mark-attendance`

- **Description**: Mark attendance for a class
- **Request Body**:

{
  "classId": "class_id",
  "subjectId": "subject_id",
  "date": "2025-07-01",
  "students": [
    { "studentId": "id1", "status": "present" },
    { "studentId": "id2", "status": "absent" }
  ]
}

GET `/teacher/attendance/:subjectId`

- Description: View attendance records for a subject

Student APIs

GET `/student/timetable`

- Description: View student’s class schedule
- Headers:

Authorization: Bearer <token>

GET `/student/attendance`

- Description: View personal attendance record

General APIs

GET `/notices`

- Description: Get all relevant notices for the logged-in user
- Headers:

Authorization: Bearer <token>


Notes

- All protected routes require a valid JWT in headers:

Authorization: Bearer <your_token>

- Standard API Response Format:
{
  "success": true,
  "data": {...},
  "message": "Optional info message"
}

