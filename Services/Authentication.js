const e = require("express");
const UserSchema = require("../Models/UserSchema");
const common = require("./Common");

const client = require("twilio")(
  "AC175f1a830e8fbf842cc929dbc16a3184",
  "558321b4a05dc448a2ed168613f5ee1c"
);

var fromContact = "+12283356016";

exports.sendotp = (req, res) => {
  let toContact = `+91${req.body.phonenumber}`;

  let otp = Math.floor(100000 + Math.random() * 900000);

  let otpKey = common.Encrypt(otp.toString(), req.body.phonenumber);

  client.messages
    .create({
      body: `Greetings from chit chat. Your 6 digit otp is ${otp}. Please do not disclose it with anyone`,
      to: toContact,
      from: fromContact,
    })
    .then((message) => {
      res.send({
        statusCode: 200,
        message: "Otp sent succefully",
        otpKey: otpKey,
      });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        statusCode: 201,
        message: "Something Went Wrong",
      });
    });
};


exports.signup = async (req, res) => {
  let encryptedpassword = common.Encrypt(
    req.body.password,
    process.env.SECERET_KEY
  );

  req.body.password = encryptedpassword;
  req.body.profileImg = "";

  try {
    let user = await UserSchema.findOne({ phoneNumber: req.body.phoneNumber });

    if (user == null) {
      await new UserSchema(req.body).save();

      let response = {
        responseCode: 200,
        message: "user inserted successfully",
      };
      res.send(response);
    } else {
      let response = {
        responseCode: 202,
        message: "User Already Exists",
      };
      res.send(response);
    }
  } catch (err) {
    console.log(err);
    let response = {
      responseCode: 201,
      message: "Something Went Wrong",
    };
    res.send(response);
  }
};

exports.login = async (req, res) => {
  try {
    let user = await UserSchema.findOne({ phoneNumber: req.body.phoneNumber });
    if (
      user != null &&
      req.body.password ===
        common.Decrypt(user.password, process.env.SECERET_KEY)
    ) {
      var token = common.createJWTToken({ id: user.id });
      var encryptedUserid = common.Encrypt(user.id, process.env.SECERET_KEY);

      let response = {
        statusCode: 200,
        message: "Login successful",
        token: token,
        userid: encryptedUserid,
        username: user.userName,
        profileImg: user.profileImg,
      };

      res.send(response);
    } else {
      let response = { statusCode: 202, message: "Invalid Credentials" };
      res.send(response);
    }
  } catch (error) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    res.send(response);
  }
};

exports.forgotPassword = async (req, res) => {
  userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
  let encryptedpassword = common.Encrypt(
    req.body.password,
    process.env.SECERET_KEY
  );

  var myquery = { id: userid };
  var newvalues = { $set: { password: encryptedpassword } };

  try {
    await UserSchema.updateOne(myquery, newvalues);

    let response = {
      statusCode: 200,
      message: "Password Changed Successfully",
    };

    res.send(response);
  } catch (error) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(error);
    res.send(response);
  }
};

exports.getProfile = async (req, res) => {
  var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  try {
    let user = await UserSchema.findOne({ _id: userid });

    let response = {
      username: user.userName,
      fullname: user.firstName,
      email: user.email,
      phonenumber: user.phoneNumber,
      profileImg: user.profileImg,
    };

    res.send(response);
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.EditProfile = async (req, res) => {
  userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  var myquery = { _id: userid };
  var newvalues = {
    $set: {
      firstName: req.body.firstName,
      userName: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      profileImg: req.body.profileImg,
    },
  };

  try {
    await UserSchema.updateOne(myquery, newvalues);

    let response = {
      statusCode: 200,
      message: "Profile Changed Successfully",
    };

    res.send(response);
  } catch (error) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(error);
    res.send(response);
  }
};

exports.changePassword = async (req, res) => {
  let userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  try {
    let user = await UserSchema.findOne({ _id: userid });

    let oldpassword = common.Decrypt(user.password, process.env.SECERET_KEY);

    if (req.body.oldpassword === oldpassword) {
      var myquery = { _id: userid };
      let newPassword = common.Encrypt(
        req.body.newpassword,
        process.env.SECERET_KEY
      );

      var newvalues = {
        $set: {
          password: newPassword,
        },
      };

      await UserSchema.updateOne(myquery, newvalues);
      let response = {
        statusCode: 200,
        message: "Password Changed Successfully",
      };

      res.send(response);
    } else {
      let response = {
        statusCode: 202,
        message: "Old Password Does not match",
      };

      res.send(response);
    }
  } catch (error) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(error);
    res.send(response);
  }
};

exports.updateProfilePic = async (req, res) => {
  userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
  var myquery = { _id: userid };
  var newvalues = {
    $set: {
      profilePic: req.body.profilePic,
    },
  };

  try {
    await UserSchema.updateOne(myquery, newvalues);

    let response = {
      statusCode: 200,
      message: "Profile Picture Changed Successfully",
    };

    res.send(response);
  } catch (error) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(error);
    res.send(response);
  }
};
