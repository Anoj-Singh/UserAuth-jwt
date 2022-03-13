const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User_Schema = require("../models/User_Model");
const Machine_Schema = require("../models/Machine_Model");

// Logut user
const userLogout = async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "LOGGED_OUT_SUCCESSFULL" });
};

//get user
const getUser = async (req, res, next) => {
  const cookie = req.cookies["jwt"];
  try {
    const verifyToken = jwt.verify(cookie, process.env.JWT_TOKEN_SECRET);
    if (!verifyToken) {
      return res.status(401).json({ message: "Unauthenticate" });
    }
    const user = await User_Schema.findOne(
      { _id: verifyToken.id },
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(404).json("Unauthenticate");
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const allUser = await User_Schema.find({
      $or: [{ user_type: "machine" }, { user_type: "department" }],
    });
    if (!allUser) {
      res.status(404).send("Not Found");
    }
    res.status(200).json(allUser);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ status: "FAILED", message: "Something went wrong !!" });
  }
};

//create user
const createUser = async (req, res, next) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    res.status(400).json({ errors: validationError.array() });
    return;
  }
  const { name, email, password, user_type } = req.body;
  let existingUser;
  try {
    existingUser = await User_Schema.findOne({ email: email });
    if (existingUser) {
      res
        .status(200)
        .send({ status: "FAILED", message: "User Already Exists!!" });
      return;
    }

    const hash_password = await bcrypt.hash(password, 12);
    const createduser = new User_Schema({
      name: name.toLowerCase(),
      email,
      password: hash_password,
      user_type,
    });
    const result = await createduser.save();
    res.status(200).json({ status: "OK", result: result });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ status: "FAILED", message: "Something went wrong !" });
  }
};

//user login
const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let findUser;
  try {
    findUser = await User_Schema.findOne({ email: email });
    if (!findUser) {
      res.status(200).json("Invalid credentials, could not log in  !!");
      return;
    }
    let isValidPassword = false;
    if (findUser) {
      try {
        isValidPassword = await bcrypt.compare(password, findUser.password);
      } catch (err) {
        res.status(500).json("Something went wrong !!");
        console.log(err);
      }
      if (!isValidPassword) {
        res.status(400).json("Invalid credentials, could not log in !!");
        return;
      }
      const token = jwt.sign(
        { id: findUser._id, user_type: findUser.user_type },
        process.env.JWT_TOKEN_SECRET
      );
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, //1 day
        sameSite: 'none', secure: true
      });
      res.status(200).json({
        status: "LOGGED_IN_SUCCESSFULLY",
      });
    }
  } catch (err) {
    res.status(500).json("Not found user");
  }
};

//Edit user
const editUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const existingUser = await User_Schema.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).send("user not find");
    }
    if (existingUser) {
      const updateMachine = await Machine_Schema.updateMany(
        { machine_id: userId },
        { machine: req.body.name }
      );
      const updateDepartment = await Machine_Schema.updateMany(
        { department_id: userId },
        { department: req.body.name }
      );
    }

    if (req.body.password) {
      const hash_password = await bcrypt.hash(req.body.password, 12);
      existingUser.name = req.body.name.toLowerCase();
      existingUser.email = req.body.email;
      existingUser.password = hash_password;
      await existingUser.save();

      return res.status(200).send("SUCCESS ALL FIELDS UPDATED !!");
    }

    existingUser.name = req.body.name.toLowerCase();
    existingUser.email = req.body.email;
    await existingUser.save();
    res.status(200).send("SUCCESS !! ");
  } catch (err) {
    console.log(err);
    res.status(404).send("Something went wrong !!");
  }
};

//delete user
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const findUser = await User_Schema.findByIdAndDelete({ _id: userId });
    if (!findUser) {
      return res.status(404).send("user not found !!");
    }
    const deleteMachine = await Machine_Schema.deleteMany({
      machine_id: userId,
    });
    const deleteDepartment = await Machine_Schema.deleteMany({
      department_id: userId,
    });
    res.status(200).send("User deleted Successfully !!");
  } catch (err) {
    console.log(err);
    res.status(404).send("Something went wrong");
  }
};

exports.userLogin = userLogin;
exports.createUser = createUser;
exports.getUser = getUser;
exports.userLogout = userLogout;
exports.editUser = editUser;
exports.deleteUser = deleteUser;
exports.getAllUser = getAllUser;
