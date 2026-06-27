const collection = require("../models/config");
const courses = require('../models/course');

// contains student information so he can view it
exports.getStudentInfo = async (req, res) => {
    // UPDATED: Passing the verified token context payload (req.user) down to the view
    res.render('student/studentInfo', { user: req.user });
};

// student home page
exports.studentHomePage = async (req, res) => {
    // UPDATED: Passing req.user to welcome the student by name on their home page dashboard
    res.render('student/studentpage', { user: req.user });
};

// student enrolled subject
exports.getStudentEnrolledSubjects = async (req, res) => {
    try {
        // UPDATED: Querying database collections using secure token identity properties
        const name1 = await collection.findOne({ name: req.user.username });
        const subject = name1 ? name1.subjects : [];
        res.render("student/chosensubjects", { subject: subject });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// Route to render the messages page for the logged-in student
exports.getStudentMessages = async (req, res) => {
    const username = req.user.username;
    try {
        const user = await collection.findOne({ name: username }).populate('messages');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('student/student-msg', { messages: user.messages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// get subjects that student can enroll to
exports.getSubjuctToStudent = async (req, res) => {
    try {
        // UPDATED: Accessing user background claims via token context payload
        const username = req.user.username;
        if (!username) return res.redirect('/');
        const dep = req.user.department ? req.user.department.toLowerCase() : "";
        
        // Condensed identical conditions safely matching your schema types
        if (["cs", "ai", "it", "all"].includes(dep)) {
            const subjects = await courses.find({ department: req.user.department,level:req.user.level});
            return res.render("student/studentsubject", { subjects: subjects });
        }
        
        res.render("student/studentsubject", { subjects: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

exports.postSubjectToStudent = async (req, res) => {
    try {
        const { code, coursename } = req.body;

        // 1. Find the course catalog entry and the student
        const existcourse = await courses.findOne({ code: code });
        if (!existcourse) {
            return res.status(400).send("Wrong subject code");
        }

        const student = await collection.findOne({ name: req.user.username });
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        // 2. Validate department and level matching
        if (existcourse.department !== req.user.department || existcourse.level != req.user.level) {
            return res.status(403).send("Cannot add this subject (Level/Department mismatch)");
        }

        // 3. Check if already enrolled in this exact course
        const isSubjectAdded = student.subjects.some(subject => subject.code === code);
        if (isSubjectAdded) {
            return res.send("Subject already added");
        }

        // 4. Validate Credit Hour/Semester Limit (Max 7 courses)
        const subjectsInSemester = student.subjects.filter(subject => subject.semester === existcourse.semester);
        if (subjectsInSemester.length >= 7) {
            return res.send("Maximum number of subjects for this semester reached");
        }

        // 5. Enforce Prerequisite Rules (Updated for ObjectId)
        if (existcourse.presubject != "None") {
            // CRITICAL FIX: Look for the prerequisite by matching ObjectIds.
            // Since student.subjects stores sub.courseId (or whatever property maps to the parent ID), 
            // use .equals() because MongoDB ObjectIds are objects, not plain strings.
            const passedPrereq = student.subjects.find(sub => 
                sub.courseId && sub.courseId.equals(existcourse.presubject)
            );

            // If they haven't taken it, or they scored less than 50, block enrollment
            if (!passedPrereq || passedPrereq.grade < 50) {
                // If you want to show the name of the prerequisite, you would need to populate it,
                // otherwise a simple error message works.
                return res.status(400).send("Cannot enroll. You must pass the prerequisite course first.");
            }
        }

        // 6. Proceed to Save Enrollment if all checks pass
        student.subjects.push({
            name: coursename,
            code: code,
            courseId: existcourse._id, // Highly recommended: store the actual course ID reference here too
            presubject: existcourse.presubject, // Saving the ObjectId reference instead of a string name
            semester: existcourse.semester,
            year: existcourse.year,
            grade: null 
        });

        await student.save();  
        
        return res.redirect('/student/studentAvailableSubjects');  

    } catch (err) {
        console.error(err);
        return res.status(500).send("Error updating subjects");
    }
};

exports.deleteSubject = async (req, res) => {
    const subjectId = req.params._id;
    try {
        const studentName = req.user.username;
        const student = await collection.findOne({ name: studentName });

        if (!student) {
            return res.status(404).send('Student not found');
        }

        const updatedSubjects = student.subjects.filter(subject => subject._id.toString() !== subjectId);
        student.subjects = updatedSubjects;
        await student.save();

        // FIXED: Using redirect to prevent post data refreshing loops on browser side
        res.redirect('/student/studentAvailableSubjects');
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Route for students to view their grades
exports.getStudentGrade = async (req, res) => {
    try {
        const student = await collection.findOne({ name: req.user.username });
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }
        res.render('student/grades', { subjects: student.subjects });
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.status(500).send('Internal Server Error');
    }
};


