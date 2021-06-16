const router = require("express").Router();



// Here important files
const connection = require("../model/connection");
const Modregis = require("../model/model");
const AdminModel = require("../model/adminModel");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const multer = require("multer");


// Here our cookie And session
router.use(cookieParser(process.env.COOKIE_SECRET));
router.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: '300000',
    resave: true,
    saveUninitialized: true,
}))


// Here passport section
router.use(passport.initialize());
router.use(passport.session());



// Here use the flash
router.use(flash());


// Here our global variable
router.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    next();
})




// Here Logout Permanent
 const checkAuthenticate = function(req, res, next) {
        if (req.isAuthenticated()) {
            res.set('Cache-Control','no-cache,private,no-store,must-revalidate,post-check=0,pre-check=0');
            return next();
        } else {
            res.redirect("/login");
        }
    }



// Here secure page
function secureRoute(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/");
}


// Here our Home Page
router.get("/", (req, res) => {
    const userFind = AdminModel.find({});
    userFind.exec(function (err, data) {
        if (err) throw err;
        res.render("index", { adminPost: data });
    })
})


// Here our register Page
router.get("/register", secureRoute, (req, res) => {
    res.render("register");
})


// Here our Login Page
router.get("/login", secureRoute, (req, res) => {
    res.render("login");
})


// Here posting data
router.post("/register",secureRoute, async (req, res) => {
    const { username, email, password, cpassword } = req.body;

    if (!username || !email || !password || !cpassword) {
        res.render("register", { error: "Please fill all the detail" });
    }
    try {
        const searchUser = await Modregis.findOne({ email });
        if (searchUser) {
            res.render("register", { error: "Sorry user already present", 'username': username, 'email': email });
        }
        else {
            const getData = await Modregis({ username, email, password, cpassword });
            if (getData.password == getData.cpassword) {
                const saveData = await getData.save();
                req.flash('success_message', "User registered Successfull")
                res.redirect("register");
            } else {
                res.render("register", { error: "Both Password are not matching", 'username': username, 'email': email });
            }
        }
    }
    catch (err) {
        console.log(err);
        res.render("register", { error: "Oops something went wrong" });
    }
})



// Here Authentication Strategy
    const localStrategy = require("passport-local").Strategy;
    passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        Modregis.findOne({ email: email }, (err, data) => {
            if (err) throw err;
            if (!data) {
                return done(null, false, { message: "User Doesn't Exist" })
            }
            bcrypt.compare(password, data.password, (err, match) => {
                if (err) {
                    return done(null, false);
                }
                if (!match) {
                    return done(null, false, { message: "Password Doesn't match" });
                }
                if (match) {
                    return done(null, data);
                };
            });
        });
    }));

    passport.serializeUser(function (user, cb) {
        cb(null, user.id);
    })

    passport.deserializeUser(function (id, cb) {
        Modregis.findById(id, function (err, user) {
            cb(err, user);
        });
    });



// Here login User
router.post("/login",secureRoute, async (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: 'login',
        successRedirect: '/',
        failureFlash: true,
    })(req, res, next)
});


// Here our logout page
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})





///////////////////////////////////////////////////////////////////////////////////////////////////


// FROM HERE OUR ADMIN PANEL HANDLE




// Here our multer logic
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter,
}).single('file');






// Here all our admin panel logic
function securityAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/");
}



function secureAdminPanel(req, res, next) {
    if (req.user.role === 'Admin') {
        next()
    } else {
        res.redirect("/");
    }
}


// Here we are getting Our Admin panel Home Page
router.get("/admin", securityAdmin, secureAdminPanel,checkAuthenticate,(req, res) => {
    const userFind = AdminModel.find({});
    userFind.exec(function (err, data) {
        if (err) throw err;
        res.render("admin", { adminPost:data});
    })
})


// Here addpost page getting
router.get("/adminAddNewPost",securityAdmin, secureAdminPanel,checkAuthenticate, (req, res) => {
    res.render("adminAddNewPost");
})



// Here addpost logic
router.post("/adminAddNewPost",securityAdmin, secureAdminPanel,checkAuthenticate, upload, async (req, res) => {
    const { title, heading, content, author } = req.body;
    const file = req.file.filename;

    if (!title || !heading || !content || !author || !file) {
        req.flasg('success_message', "Please fill all the detail")
        res.redirect("adminAddNewPost");
    }
    try {
        const getData = new AdminModel({ title, heading, content, author, file });
        const saveData = await getData.save();
        if (saveData) {
            const userFind = AdminModel.find({});
            userFind.exec(function (err, data) {
                if (err) throw err;
                res.render("adminAddNewPost", { success_message: "Post added Successfull" });
            })
        } else {
            res.render("adminAddNewPost", { error: "Oops something went wrong" });
        }
    }
    catch (err) {
        console.log(err);
        res.render("adminAddNewPost", { error: "Oops something went wrong" });
    }
});


// Here delete post logic
router.get("/delete/:id",securityAdmin, secureAdminPanel,checkAuthenticate, (req, res) => {
    const deleteid = req.params.id;
    const queryfordelete = AdminModel.findByIdAndDelete(deleteid);
    const deleted = queryfordelete.exec(function (err) {
        if (err) throw err;
        req.flash('success_message', "Post Deleted Successfull");
        res.redirect("/admin");
    });
});


// Here update post logic

// First we find the post by Id
router.get("/:id",securityAdmin, secureAdminPanel,checkAuthenticate, (req, res) => {
    const editId = req.params.id;
    const datafind = AdminModel.findById(editId);

    datafind.exec(function (err, data) {
        if (err) throw err;
        res.render("adminUpdatePost", { adminPost: data });
    })
});

// Here we update Data
router.post("/adminUpdatePost",securityAdmin, secureAdminPanel,checkAuthenticate, upload, (req, res) => {
    if (req.file) {
        var imageCheck = {
            title: req.body.title,
            heading: req.body.heading,
            content: req.body.content,
            author: req.body.author,
            file: req.file.filename,
        }
    } else {
        var imageCheck = {
            title: req.body.title,
            heading: req.body.heading,
            content: req.body.content,
            author: req.body.author,
        }

    }
    const update = AdminModel.findByIdAndUpdate(req.body.id, imageCheck);
    update.exec(function (err, data) {
        if (err) throw err;
        req.flash('success_message', "Post Update Successfull");
        res.redirect("admin");
    })
});




// Here we export the router
module.exports = router;

