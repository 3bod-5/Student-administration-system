const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController'); 

// Import your centralized JWT middleware guards
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Lock down all endpoints in this file to authorized students only
// 1. First confirm they have a valid token cookie
// 2. Then ensure their account role is explicitly 'student'
router.use(authenticateToken);
router.use(authorizeRole(['student']));

// ==========================================
// SECURED STUDENT PORTAL ROUTES
// ==========================================

// Main Student Dashboard
router.route('/studentpage')
    .get(studentController.studentHomePage);

// Student Profile / Info
router.route('/StudentInfo')
    .get(studentController.getStudentInfo);

// View Enrolled Subjects
router.route('/studentAvailableSubjects')
    .get(studentController.getStudentEnrolledSubjects);

// View and Add available subjects
router.route('/subjectToStudent')
    .get(studentController.getSubjuctToStudent)
    .post(studentController.postSubjectToStudent);   

// Delete a subject
router.route('/deleteSubject/:_id')
    .post(studentController.deleteSubject);    

// View Grades
router.route('/getStudentGrades')
    .get(studentController.getStudentGrade);

// View Messages
router.route('/messages')
    .get(studentController.getStudentMessages);

module.exports = router;