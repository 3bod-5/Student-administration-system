const mongoose = require("mongoose");

// 1. Message Schema Definition
const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// 2. Subject Schema Definition
const subjectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    code: {
        type: String,
        required: true,
        uppercase: true, // Automatically sanitizes codes like "cs101" to "CS101"
        trim: true
    },
    presubject: {
        type: String,
        default: "None" // Prevents crashes if there isn't a prerequisite course
    },
    grade: { 
        type: Number, 
        default: null 
    },
    semester: { 
        type: String 
    },
    year: { 
        type: Number 
    }
});

// 3. Main User/Login Schema Definition
const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Fixed typo: changed 'require' to 'required'
        trim: true
    },
    password: {
        type: String,
        required: true // Fixed typo: changed 'require' to 'required'
    },
    type: {
        type: String,
        required: true, // Fixed typo: changed 'require' to 'required'
        enum: ['student', 'admin', 'staff'] // Restricts types to your system's design roles
    },
    department: {
        type: String,
        required: true, // Fixed typo: changed 'require' to 'required'
        trim: true
    },
    email: {
        type: String,
        unique: true, // Ensures no duplicate emails are saved in your system
        sparse: true  // Allows multiple users to have 'null/blank' emails without breaking unique validation
    },
    nationality: {
        type: String
    },
    dateofbirth: {
        type: Date
    },
    level: {
        type: String
    },
    subjects: [subjectSchema], // Imbedded sub-documents array mapping
    messages: [messageSchema]   // Imbedded sub-documents array mapping
}, { timestamps: true }); // Automatically manages createdAt and updatedAt tracking info fields for you

// Create and export the collection model
const Collection = mongoose.model("User", loginSchema); // Standardized model name casing convention
module.exports = Collection;