const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

exports.Encrypt = (string, key) => {
  return CryptoJS.AES.encrypt(string, key).toString();
};

exports.Decrypt = (string, key) => {
  return CryptoJS.AES.decrypt(string, key).toString(CryptoJS.enc.Utf8);
};

exports.createJWTToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.VerifyFWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
