const bcrypt = require('bcrypt');
const collection = require("../models/config");
const courses = require('../models/course');

// get admin home page
exports.adminHomePage = (req, res) => {
    // PASS USER DATA: Now you can pass the logged-in admin's profile data 
    // to your dashboard view to display their name!
    res.render("admin/adminhome", { user: req.user });
};

// admin can view or add a user
exports.getAllUsers = async (req, res) => {
    try {
        // FIXED: Changed req.body.studentname to req.query.studentname or req.body.studentname safely.
        // If your search form uses a GET request, it comes through req.query, not req.body!
        const searchName = req.query.studentname || req.body.studentname || "";
        
        let name1 = null;
        if (searchName) {
            name1 = await collection.findOne({ name: searchName });
        }

        const allusers = await collection.find();
        res.render("admin/all-users", { users: allusers, user: name1 });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.addUser = async (req, res) => {
    try {
        const userData = req.body; 
        
        // Find if user already exists
        const existuser = await collection.findOne({ name: userData.username }); 
        if (existuser) {
            return res.send("User already exists, try another name");
        }
        
        // Hash the password and replace it in the data object
        const hashedpassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedpassword;
        
        // Map 'username' from form input to 'name' in your Schema
        userData.name = userData.username;

        // Use .create() for a single object instead of insertMany()
        await collection.create(userData);
        
        // REDIRECT instead of rendering directly to prevent form re-submission bugs
        res.redirect('/admin/all-users');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding user");
    }
};

exports.addUserPage = (req, res) => {
    res.render('admin/add-user');
};

exports.deleteUser = async (req, res) => {
    const { _id } = req.params;
    try {
        await collection.deleteOne({ _id });
        console.log("user deleted successfully");
        res.redirect("/admin/all-users"); // Better fallback redirect target
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};

exports.updateUser = async (req, res) => {
    const { _id } = req.params;
    try {
        await collection.findOneAndUpdate({ _id }, req.body);
        console.log("user updated successfully");
        res.redirect("/admin/all-users"); // Better fallback redirect target
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
};
exports.updateUserPage = async (req,res)=>{
    const { _id } = req.params;
    try {
        // 1. Find the specific course by its ID
        const user = await collection.findById(_id); 
        
        if (!user) {
            return res.status(404).send("user not found");
        }

        // 2. Render your edit template and pass the user data to it
        res.render("admin/updateUser", { user }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
}

exports.searchAUserPage = (req, res) => {
    res.render('admin/search-user');
};

exports.showStudentGrades = async (req, res) => {
    try {
        const find = await collection.findOne({ name: req.body.name });
        const subject = find ? find.subjects : [];
        res.render("admin/studentgrades", { subject: subject });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching grades");
    }
};

exports.searchResult = async (req, res) => {
    const { name } = req.query;
    try {
        const user = await collection.findOne({ name });
        if (!user) {
            return res.render('admin/result', { userNotFound: true, invalidtype: false });
        }

        if (user.type === 'student') {
            return res.render('admin/result', { user, userNotFound: false, invalidtype: false, subjects: user.subjects });
        } else if (user.type === 'staff') {
            const course = await courses.find({ doctorname: name });
            return res.render('admin/result', { user, userNotFound: false, invalidtype: false, courses: course });
        } else {
            return res.render('admin/result', { userNotFound: false, invalidtype: true });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};

// admin can view or add a course(subject)
exports.getAllCourses = async (req, res) => {
    try {
        const allcourses = await courses.find();
        res.render("admin/all-courses", { courses: allcourses });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.addNewCourse = async (req, res) => {
    try {
        const data = req.body;

        if (data.code) data.code = data.code.trim().toUpperCase();

        const existcourse = await courses.findOne({ code: data.code });
        if (existcourse) return res.status(400).send("Course already exists");

        // ... Keep your level and department validations here ...

        // Handle Prerequisite mapping to ObjectId
        if (data.presubject && data.presubject.trim() !== null) {
            // Find the prerequisite course document by its name
            const validPrereq = await courses.findOne({ name: data.presubject.trim() });
            
            if (!validPrereq) {
                return res.status(400).send(`The prerequisite course "${data.presubject}" does not exist.`);
            }
            
            // CRITICAL FIX: Replace the text "Cloud" with its actual MongoDB _id
            data.presubject = validPrereq._id; 
        } else {
            data.presubject = null; // Use null instead of "None" for ObjectIds
        }

        await courses.create(data);
        return res.redirect("/admin/all-courses");

    } catch (err) {
        console.error(err);
        return res.status(500).send("Error adding course");
    }
};

exports.addNewCoursePage = (req, res) => {
    res.render('admin/add-courses');
};

exports.deleteCourse = async (req, res) => {
    const { _id } = req.params;
    try {
        await courses.deleteOne({ _id });
        console.log("course deleted successfully");
        res.redirect("/admin/all-courses");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting course");
    }
};
exports.updateCourse = async (req,res)=>{
    const { _id } = req.params;
    try {
        await courses.findOneAndUpdate({ _id },req.body);
        console.log("Course updated successfully");
        res.redirect("/admin/all-courses");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating Course");
    }
}
exports.updateCoursePage = async (req,res)=>{
    const { _id } = req.params;
    try {
        // 1. Find the specific course by its ID
        const course = await courses.findById(_id); 
        
        if (!course) {
            return res.status(404).send("Course not found");
        }

        // 2. Render your edit template and pass the course data to it
        res.render("admin/updateCourse", { course }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
}


