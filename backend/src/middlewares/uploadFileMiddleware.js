import multer from "multer";
import { httpStatusCode } from "../constants/httpStatusCode.js";
import { httpStatusMsg } from "../constants/httpStatusMsg.js";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = file.originalname.split(".").pop();
		cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
	},
});

const uploadFile = (filetype = "image") => {
	const fileTypeFilter = (req, file, cb) => {
		const extension = file.originalname.split(".").pop().toLowerCase();
		if (filetype === "image" && ["jpg", "jpeg", "png", "svg", "bmp", "webp"].includes(extension)) {
			cb(null, true);
		} else if (filetype === "doc" && ["txt", "pdf", "csv", "xlsx", "xls", "json", "ppt"].includes(extension)) {
			cb(null, true);
		} else {
			cb({
				status: httpStatusCode.BAD_REQUEST,
				message: "File format not supported",
				statusMsg: httpStatusMsg.VALIDATION_FAILED,
			});
		}
	};
	return multer({
		storage: storage,
		fileFilter: fileTypeFilter,
		limits: {
			fileSize: 5000000,
		},
	});
};

export default uploadFile;
