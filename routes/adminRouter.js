const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 

// Import the modular middleware guards
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Secure this entire file: 
// 1. First ensure they have a valid token
// 2. Then verify their role type is strictly 'admin'
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// ==========================================
// SECURED ADMIN ROUTES
// ==========================================
router.get('/', adminController.adminHomePage);

router.route('/add-user')
    .get(adminController.addUserPage) 
    .post(adminController.addUser);

router.get('/all-users', adminController.getAllUsers);     
router.post('/all-users', adminController.getAllUsers); 
router.post('/delete-user/:_id', adminController.deleteUser);    
router.post('/update-user/:_id', adminController.updateUser); 
router.get('/updateUserPage/:_id', adminController.updateUserPage); 
router.get('/search-student', adminController.searchAUserPage);    
router.get('/search/result', adminController.searchResult); 
router.post('/student-grade', adminController.showStudentGrades); 

router.route('/add-course')
    .get(adminController.addNewCoursePage) 
    .post(adminController.addNewCourse);

router.get('/all-courses', adminController.getAllCourses);     
router.post('/delete-course/:_id', adminController.deleteCourse); 
router.post('/update-course/:_id', adminController.updateCourse); 
router.get('/updateCoursePage/:_id', adminController.updateCoursePage);
module.exports = router;

   