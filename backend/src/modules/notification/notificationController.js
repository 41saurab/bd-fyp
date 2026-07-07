import { notificationService } from "./notificationService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class NotificationController {
    getNotifications = async (req, res, next) => {
        try {
            const data = await notificationService.getNotifications(req.loggedInUser._id);
            res.status(httpStatusCode.OK).json({
                statusMsg: httpStatusMsg.SUCCESS,
                message: "Notifications fetched",
                data,
                options: null,
            });
        } catch (error) {
            next(error);
        }
    };

    markAsRead = async (req, res, next) => {
        try {
            await notificationService.markAsRead(req.params.id);
            res.status(httpStatusCode.OK).json({
                statusMsg: httpStatusMsg.SUCCESS,
                message: "Marked as read",
                data: null,
                options: null,
            });
        } catch (error) {
            next(error);
        }
    };

    markAllAsRead = async (req, res, next) => {
        try {
            await notificationService.markAllAsRead(req.loggedInUser._id);
            res.status(httpStatusCode.OK).json({
                statusMsg: httpStatusMsg.SUCCESS,
                message: "All marked as read",
                data: null,
                options: null,
            });
        } catch (error) {
            next(error);
        }
    };
}

export const notificationController = new NotificationController();
