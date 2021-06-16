const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Here our schema

const Schauth = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'User',
  }
},
  { timestamps: true });



// Here hash the password
Schauth.pre("save", async function () {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
      this.cpassword = await bcrypt.hash(this.cpassword, 10);
    }
  }
  catch (err) {
    console.log(err);
  }
})



// Here our Model
const Schmodel = mongoose.model("user", Schauth);

// Here export the module
module.exports = Schmodel;