import Joi from "joi";

export const registerDonorDTO = Joi.object({
	name: Joi.string().min(2).max(100).required().label("name"),
	email: Joi.string().email().required().label("email"),
	password: Joi.string().min(6).required().label("password"),
	confirmPassword: Joi.string().valid(Joi.ref("password")).required().label("confirmPassword"),
	phone: Joi.string().allow("", null).optional().label("phone").min(10).max(10),
	city: Joi.string().allow("", null).optional().label("city"),
	bloodType: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required().label("bloodType"),
	dateOfBirth: Joi.date().allow(null).optional().label("dateOfBirth"),
	gender: Joi.string().valid("male", "female", "other").allow(null).optional().label("gender"),
	weight: Joi.number().allow(null).optional().label("weight"),
});

export const loginDTO = Joi.object({
	email: Joi.string().email().required().label("email"),
	password: Joi.string().required().label("password"),
});

export const updateDonorDTO = Joi.object({
	name: Joi.string().min(2).max(100).optional().label("name"),
	phone: Joi.string().allow("", null).optional().label("phone").min(10).max(10),
	city: Joi.string().allow("", null).optional().label("city"),
	weight: Joi.number().allow(null).optional().label("weight"),
	availability: Joi.boolean().optional().label("availability"),
	address: Joi.string().allow("", null).optional().label("address"),
	notificationPreferences: Joi.string().optional().label("notificationPreferences"),
	medicalConditions: Joi.string().optional().label("medicalConditions"),
});
