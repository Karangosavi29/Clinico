import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";




// allowedRoles is a list of roles that can access the route
export const roleMiddleware = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    // Make sure req.user is set by verifyJWT
    if (!req.user) {
      throw new ApiError(401, "Unauthorized. User not found.");
    }

    // Check if user's role is in allowedRoles
    if(!allowedRoles.includes(req.user.role)){
        throw new ApiError(403, "Access denied. You do not have permission to perform this action.");
    }

    // Role is allowed, continue to next middleware/controller
    next();
});