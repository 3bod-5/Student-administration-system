const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    doctorname: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: Number,
        required: true,
        min: 1, // Ensures invalid levels aren't accepted
        max: 4
    },
    code: {
        type: String,
        required: true,
        unique: true,   // Ensures two different courses can't share the same code
        uppercase: true, // Automatically converts "cs211" to "CS211"
        trim: true
    },
    // Inside your courseSchema definition:
    presubject: {
        type:String,
        default: null // null means there is no prerequisite
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        default: () => new Date().getFullYear() // Defaults automatically to the current year
    },
    semester: {
        type: String,
        trim: true
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Course = mongoose.model("Course", courseSchema); // Standardized uppercase model naming convention
module.exports = Course;