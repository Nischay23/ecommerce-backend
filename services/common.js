import passport from "passport";

export function isAuth(req, res, done) {
  return passport.authenticate("jwt");
}

export function sanitizeUser(user) {
  return { id: user.id, role: user.role };
}
export function cookieExtractor(req) {
  let token = null;

  // Check cookies
  if (req && req.cookies) {
    token = req.cookies.token;
  }

  // Check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  console.log("Extracted Token:", token); // Debug token extraction
  return token;
}
