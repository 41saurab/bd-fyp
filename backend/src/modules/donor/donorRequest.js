import Joi from "joi";

const NEPAL_PHONE_PATTERN = /^(97|98)\d{8}$/;

export const registerDonorDTO = Joi.object({
	name: Joi.string()
		.regex(/^([A-Za-z]+(?:\s[A-Za-z]+){1,2})$/)
		.required()
		.messages({
			"string.empty": "Full name is required.",
			"any.required": "Full name is required.",
			"string.pattern.base": "Full name must include first and last name (letters only, optionally a middle name).",
		}),

	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			"string.empty": "Email address is required.",
			"any.required": "Email address is required.",
			"string.email": "Please enter a valid email address.",
		}),

	password: Joi.string().min(6).max(72).required().messages({
		"string.empty": "Password is required.",
		"any.required": "Password is required.",
		"string.min": "Password must be at least 6 characters.",
		"string.max": "Password must not exceed 72 characters.",
	}),

	confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
		"string.empty": "Please confirm your password.",
		"any.required": "Please confirm your password.",
		"any.only": "Passwords do not match.",
	}),

	phone: Joi.string().pattern(NEPAL_PHONE_PATTERN).allow("", null).optional().messages({
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),

	city: Joi.string().max(50).allow("", null).optional().messages({
		"string.max": "City name must not exceed 50 characters.",
	}),

	bloodType: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required().messages({
		"any.only": "Please select a valid blood type.",
		"any.required": "Blood type is required.",
		"string.empty": "Blood type is required.",
	}),

	dateOfBirth: Joi.date()
		.max("now")
		.custom((value, helpers) => {
			const ageMs = Date.now() - new Date(value).getTime();
			const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
			if (ageYears < 18) return helpers.error("date.tooYoung");
			if (ageYears > 65) return helpers.error("date.tooOld");
			return value;
		})
		.allow(null)
		.optional()
		.messages({
			"date.max": "Date of birth cannot be in the future.",
			"date.tooYoung": "Donor must be at least 18 years old.",
			"date.tooOld": "Donor must be 65 years old or younger.",
		}),

	gender: Joi.string().valid("male", "female", "other").allow(null).optional().messages({
		"any.only": "Gender must be male, female, or other.",
	}),

	weight: Joi.number().min(60).max(300).allow(null).optional().messages({
		"number.min": "Minimum weight to donate blood is 60 kg.",
		"number.max": "Please enter a realistic weight.",
	}),

	latitude: Joi.number().min(-90).max(90).optional().messages({
		"number.base": "Latitude must be a number.",
		"number.min": "Latitude must be between -90 and 90.",
		"number.max": "Latitude must be between -90 and 90.",
	}),

	longitude: Joi.number().min(-180).max(180).optional().messages({
		"number.base": "Longitude must be a number.",
		"number.min": "Longitude must be between -180 and 180.",
		"number.max": "Longitude must be between -180 and 180.",
	}),
});

export const loginDTO = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			"string.empty": "Email address is required.",
			"any.required": "Email address is required.",
			"string.email": "Please enter a valid email address.",
		}),

	password: Joi.string().required().messages({
		"string.empty": "Password is required.",
		"any.required": "Password is required.",
	}),
});

export const updateDonorDTO = Joi.object({
	name: Joi.string().min(2).max(100).optional().messages({
		"string.min": "Name must be at least 2 characters.",
		"string.max": "Name must not exceed 100 characters.",
	}),

	phone: Joi.string().pattern(NEPAL_PHONE_PATTERN).allow("", null).optional().messages({
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),

	city: Joi.string().max(50).allow("", null).optional().messages({
		"string.max": "City name must not exceed 50 characters.",
	}),

	weight: Joi.number().min(30).max(300).allow(null).optional().messages({
		"number.min": "Weight seems too low — please check.",
		"number.max": "Weight seems too high — please check.",
	}),

	availability: Joi.boolean().optional(),

	address: Joi.string().max(200).allow("", null).optional().messages({
		"string.max": "Address must not exceed 200 characters.",
	}),

	notificationPreferences: Joi.string().optional(),

	medicalConditions: Joi.string().optional(),

	latitude: Joi.number().min(-90).max(90).allow(null).optional().messages({
		"number.min": "Latitude must be between -90 and 90.",
		"number.max": "Latitude must be between -90 and 90.",
	}),
	longitude: Joi.number().min(-180).max(180).allow(null).optional().messages({
		"number.min": "Longitude must be between -180 and 180.",
		"number.max": "Longitude must be between -180 and 180.",
	}),
});
