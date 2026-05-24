import { httpStatusCode } from "../constants/httpStatusCode.js";
import { httpStatusMsg } from "../constants/httpStatusMsg.js";

export const checkPermission = (allowedBy) => {
    return (req, res, next) => {
        if (!allowedBy || allowedBy.length === 0) {
            next({
                status: httpStatusCode.ACCESS_DENIED,
                message: "User role required",
                statusMsg: httpStatusMsg.NOT_FOUND,
            });
        } else if (!Array.isArray(allowedBy)) {
            next({
                status: httpStatusCode.ACCESS_DENIED,
                message: "Role should be array",
                statusMsg: httpStatusMsg.NOT_FOUND,
            });
        } else {
            const loggedInUserRole = req.loggedInUser.role;
            if (allowedBy.includes(loggedInUserRole)) {
                next();
            } else {
                next({
                    status: httpStatusCode.ACCESS_DENIED,
                    message: "You do not have permission to access this endpoint",
                    statusMsg: httpStatusMsg.UNAUTHORIZED,
                });
            }
        }
    };
};
