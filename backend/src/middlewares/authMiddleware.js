import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { userModel } from "../modules/userModel.js";
import { httpStatusCode } from "../constants/httpStatusCode.js";
import { httpStatusMsg } from "../constants/httpStatusMsg.js";

dotenv.config({ quiet: true });

export const checkLogin = async (req, res, next) => {
    try {
        let token = req.headers["authorization"] || null;
        if (!token) {
            throw {
                status: httpStatusCode.UNAUTHENTICATED,
                message: "Login first",
                statusMsg: httpStatusMsg.UNAUTHENTICATED,
            };
        }
        token = token.split(" ").pop();

        const data = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(data.sub).select("-password");
        if (!user) {
            throw {
                status: httpStatusCode.UNAUTHENTICATED,
                message: "User not found",
                statusMsg: httpStatusMsg.USER_NOT_FOUND,
            };
        }

        if (!user.isActive) {
            throw {
                status: httpStatusCode.UNAUTHORIZED,
                message: "Account deactivated",
                statusMsg: httpStatusMsg.ACCOUNT_DEACTIVATED,
            };
        }

        req.loggedInUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            city: user.city,
        };
        next();
    } catch (exception) {
        if (exception instanceof jwt.TokenExpiredError) {
            next({
                status: httpStatusCode.UNAUTHENTICATED,
                message: exception.message,
                statusMsg: httpStatusMsg.TOKEN_EXPIRED,
            });
        } else if (exception instanceof jwt.JsonWebTokenError) {
            next({
                status: httpStatusCode.UNAUTHENTICATED,
                message: exception.message,
                statusMsg: httpStatusMsg.UNAUTHENTICATED,
            });
        } else {
            next(exception);
        }
    }
};

// Unlike checkLogin, this never blocks the request. If a valid token is
// present it populates req.loggedInUser (same shape as checkLogin); if not
// (missing/invalid/expired token, or no token at all — a guest), it simply
// continues with req.loggedInUser left undefined. Used on routes that are
// public but need to tailor their response for a logged-in viewer (e.g.
// showing full respondent identities only to the owning org/admin).
export const optionalAuth = async (req, res, next) => {
    try {
        let token = req.headers["authorization"] || null;
        if (!token) return next();

        token = token.split(" ").pop();
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(data.sub).select("-password");

        if (user && user.isActive) {
            req.loggedInUser = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                city: user.city,
            };
        }
        next();
    } catch (exception) {
        // Invalid/expired token on a public route — treat as a guest rather
        // than failing the request.
        next();
    }
};
