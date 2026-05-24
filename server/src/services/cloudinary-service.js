import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

class FileUploadService {
	static async uploadFile(filePath, folder = "/uploads") {
		let uploaded = null;
		try {
			uploaded = await cloudinary.uploader.upload(filePath, {
				folder,
				resource_type: "auto",
				unique_filename: true,
				secure: true,
			});
			return uploaded.secure_url;
		} finally {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
	}

	static async deleteFile(publicId) {
		return await cloudinary.uploader.destroy(publicId);
	}
}

export default FileUploadService;
