const collection = require("../models/config");
const courses = require('../models/course');

// 1. Staff Profile Info

exports.staffHomePage = (req,res) => {
    res.render("staff/staffhome");
    
}
exports.getStaffInfo = (req, res) => {
    // UPDATED: Now reading entirely out of the JWT token context payload (req.user)
    res.render("staff/staffinfo", {
        username: req.user.username,
        type: req.user.type,
        department: req.user.department
    });
    console.log(req.user);
};

// 2. Doctor Courses Listing
exports.getDoctorCourses = async (req, res) => {
    try {
        // UPDATED: Uses token state to query only courses assigned to this specific doctor
        const doctorcourses = await courses.find({ doctorname: req.user.username });
        res.render("staff/doctorCourses", { courses: doctorcourses });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 3. View All Students List
exports.getAllStudents = async (req, res) => {
    try {
        const name1 = await collection.findOne({ name: req.query.studentname });  
        const allusers = await collection.find({ type: "student" });
        res.render("staff/all-students", { users: allusers, user: name1 });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 4. Search Form Page
exports.getSearchStudentPage = (req, res) => {
    res.render("staff/search-student", { student: null, message: '' });
};

// 5. View Student Grades Sheet
exports.getStudentGrades = async (req, res) => {
    const name = req.query.studentname;
    try {
        const student = await collection.findOne({ name: name });
        if (student) {
            return res.render("staff/student-grade", { subjects: student.subjects, student: student });
        } 
        return res.render("staff/student-grade", { subjects: [], message: 'Student not found' });
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.render("staff/student-grade", { subjects: [], message: 'An error occurred' });
    }
};

// 6. Submit or Update a Grade
exports.addGrade = async (req, res) => {
    const { studentId, subjectId } = req.params;
    const { grade } = req.body;
    try {
        const student = await collection.findById(studentId);
        if (!student) return res.status(404).send('Student not found');

        const subject = student.subjects.id(subjectId);
        if (!subject) return res.status(404).send('Subject not found');

        subject.grade = grade;
        await student.save();

        res.redirect(`/staff/student-grades?studentname=${student.name}`);
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).send('Internal Server Error');
    }
};

// 7. Get Messages
exports.getMessages = async (req, res) => {
    try {
        // UPDATED: Fetches messaging logs based directly on authenticated payload information
        const user = await collection.findOne({ name: req.user.username });
        if (!user) return res.status(404).send('User not found');
        res.render('staff/sendMsg', { messages: user.messages || [] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// 8. Send Message
exports.sendMessage = async (req, res) => {
    const { recipient, message } = req.body;
    
    // UPDATED: Extracted sender context identity directly from verified secure cookied state
    const sender = req.user.username;
    
    if (!message || !message.trim()) return res.status(400).send('Content required');

    try {
        const user = await collection.findOne({ name: sender });
        if (!user) return res.status(404).send('User not found');

        const msgPayload = { sender, recipient, message };
        user.messages.push(msgPayload);
        await user.save();

        const recipientUser = await collection.findOne({ name: recipient });
        if (recipientUser) {
            recipientUser.messages.push(msgPayload);
            await recipientUser.save();
        }
        res.redirect('/staff/messages');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};