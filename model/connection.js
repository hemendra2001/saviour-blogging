require("dotenv").config();
const mongoose = require("mongoose");


// Here our connection

const connection = mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Congatulations your connection successfull");
}).catch((err) => {
    console.log(err);
})



// Here export the module
module.exports = connection;