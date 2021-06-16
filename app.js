require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const path = require("path");



// Here our path
const pulicPath = path.join(__dirname,"public/");
const ejsPath = path.join(__dirname,"views/");
const authPath = path.join(__dirname,"controller/auth");
const bootcssPath = path.join(__dirname,"node_modules/bootstrap/dist/css");
const bootjsPath = path.join(__dirname,"node_modules/bootstrap/dist/js");
const bootJqPath = path.join(__dirname,"node_modules/jquery/dist");



// Here important module
const connection = require("./model/connection");
const Modregis = require("./model/model");
const cookirParser = require("cookie-parser");


app.use(express.json());
app.use(cookirParser());
app.use(express.urlencoded({extended:false}));



// Here our important file
app.use(express.static(pulicPath));
app.set("view engine","ejs");
app.set("views",ejsPath)
app.use(require(authPath));
app.use("/css",express.static(bootcssPath));
app.use("/js",express.static(bootjsPath));
app.use("/jq",express.static(bootJqPath));



// Here listen
app.listen(PORT,()=>{
    console.log(`Hurray your server is running on ${PORT}`);
})