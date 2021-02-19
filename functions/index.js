const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.newUserSignup = functions.auth.user().onCreate((user) => {
  return admin.database().ref("test").set(user.email);
});
