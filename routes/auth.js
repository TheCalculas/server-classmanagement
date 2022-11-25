const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const jwts = "hellouser";
const fetchuser = require("../middleware/fetchUser");

const { body, validationResult } = require("express-validator");
// NOTE: this is route 1 which creates the user
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 5 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    // const user = User(req.body);
    // user.save();
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ err: "Sorry the user alredy exist" });
      }
      let salt = await bcrypt.genSalt(10);
      let securePass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        password: securePass,
        email: req.body.email,
      });
      // .then((user) => res.json(user));

      const data = {
        user: {
          id: user.id,
        },
      };
      var authToken = jwt.sign(data, jwts);
      console.log(authToken);

      res.json({ authToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ err: "Some error occurred" });
    }

    // res.send(req.body);
  }
);

// NOTE: this is route 2 which auth the user creds...
router.post(
  "/login",
  [
    body("email", "enter a valid email address").isEmail(),
    body("password", "Enter a valid password it can't be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare || !user) {
        return res.status(400).json({ error: "Invalid Cred" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      // sabse phele meine jwt mei sign kiya
      var authToken = jwt.sign(data, jwts);
      // phir meine auth token ko fetch kiya
      console.log(authToken);

      res.json({ authToken });
    } catch (error) {
      return res.status(500).send("Internal Sever error occured");
    }
  }
);

// NOTE: this is ROUTE 3 which will fetch the user details ... Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    // it will fetch all the user details except the password
    let user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    return res.status(500).send("Internal Sever error occured");
  }
});
module.exports = router;
