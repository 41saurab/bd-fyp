import { notificationModel } from "./notificationModel.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class NotificationService {
    async getNotifications(userId) {
        return notificationModel
            .find({ recipient: userId })
            .sort("-createdAt")
            .limit(50);
    }

    async markAsRead(notificationId) {
        await notificationModel.findByIdAndUpdate(notificationId, { read: true });
    }

    async markAllAsRead(userId) {
        await notificationModel.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );
    }
}

export const notificationService = new NotificationService();
