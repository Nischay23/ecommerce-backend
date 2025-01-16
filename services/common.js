const passport = require("passport");

exports.isAuth = (req, res, done) => {
  return passport.authenticate("jwt");
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  //TODO : this is temporary token for testing without cookie
  token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODk2NzI1MjlhM2NiYTA5ZTZhOWQ2YSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM3MDYyMzQwLCJleHAiOjE3MzcwNjU5NDB9.vbUPdkWvgEDonZ-lr7ygIXBpXjwR1ERblRKfELYr_Ao";
  return token;
};
