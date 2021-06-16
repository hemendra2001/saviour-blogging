const mongoose = require("mongoose");


// Here Schema

const adminSch = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },
    heading: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
});

// Here model
const AdminModel = mongoose.model('adminpanel', adminSch);


// Export the module
module.exports = AdminModel;