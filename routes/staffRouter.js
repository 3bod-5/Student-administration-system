const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Import your new modular JWT middleware guards
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Apply your global JWT verification to all routes within this staff file
// 1. First confirm they have a valid token cookie
// 2. Then ensure their role 'type' is exactly 'staff'
router.use(authenticateToken);
router.use(authorizeRole(['staff']));

// ==========================================
// SECURED STAFF / DOCTOR ROUTES
// ==========================================

router.route('/staffhome')
    .get(staffController.staffHomePage);

// Profile


router.route('/staffinfo')
    .get(staffController.getStaffInfo);

// Courses
router.route('/doctorCourses')
    .get(staffController.getDoctorCourses);

// Students Lists & Profiles
router.route('/all-students')
    .get(staffController.getAllStudents);

router.route('/search-student')
    .get(staffController.getSearchStudentPage);

// Grades Operations
router.route('/student-grades')
    .get(staffController.getStudentGrades);

router.route('/add-grade/:studentId/:subjectId')
    .post(staffController.addGrade);

// Communications/Messaging
router.route('/messages')
    .get(staffController.getMessages);

router.route('/send')
    .post(staffController.sendMessage);

module.exports = router;