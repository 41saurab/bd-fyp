import { httpStatusCode } from "../constants/httpStatusCode.js";
import { httpStatusMsg } from "../constants/httpStatusMsg.js";

export const bodyValidator = (schemaDTO) => {
    return async (req, res, next) => {
        try {
            let data = req.body;

            await schemaDTO.validateAsync(data, { abortEarly: false });

            next();
        } catch (exception) {
            let msg = {};

            exception.details.map((error) => {
                msg[error.context.label] = error.message;
            });

            next({
                detail: msg,
                status: httpStatusCode.BAD_REQUEST,
                message: "Validation failed",
                statusMsg: httpStatusMsg.VALIDATION_FAILED,
            });
        }
    };
};
