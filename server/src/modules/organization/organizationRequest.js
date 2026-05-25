import Joi from "joi";

const NEPAL_PHONE_PATTERN = /^(97|98)\d{8}$/;

export const registerOrgDTO = Joi.object({
	name: Joi.string().min(2).max(100).required().messages({
		"string.empty": "Contact person name is required.",
		"any.required": "Contact person name is required.",
		"string.min": "Name must be at least 2 characters.",
		"string.max": "Name must not exceed 100 characters.",
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

	phone: Joi.string().pattern(NEPAL_PHONE_PATTERN).required().messages({
		"string.empty": "Phone number is required.",
		"any.required": "Phone number is required.",
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),

	orgName: Joi.string().min(3).max(150).required().messages({
		"string.empty": "Organization name is required.",
		"any.required": "Organization name is required.",
		"string.min": "Organization name must be at least 3 characters.",
		"string.max": "Organization name must not exceed 150 characters.",
	}),

	orgType: Joi.string().valid("hospital", "blood_bank", "clinic", "ngo", "other").required().messages({
		"any.only": "Organization type must be one of: hospital, blood bank, clinic, NGO, or other.",
		"any.required": "Organization type is required.",
		"string.empty": "Organization type is required.",
	}),

	registrationNumber: Joi.string().length(9).pattern(/^\d+$/).required().messages({
		"string.empty": "PAN number is required.",
		"any.required": "PAN number is required.",
		"string.length": "PAN number must be exactly 9 digits.",
		"string.pattern.base": "PAN number must contain digits only.",
	}),

	address: Joi.string().max(200).required().messages({
		"string.empty": "Address is required.",
		"any.required": "Address is required.",
		"string.max": "Address must not exceed 200 characters.",
	}),

	city: Joi.string().max(50).required().messages({
		"string.empty": "City is required.",
		"any.required": "City is required.",
		"string.max": "City name must not exceed 50 characters.",
	}),

	website: Joi.string().uri().allow("", null).optional().messages({
		"string.uri": "Please enter a valid website URL (e.g. https://example.com).",
	}),

	description: Joi.string().max(500).allow("", null).optional().messages({
		"string.max": "Description must not exceed 500 characters.",
	}),

	contactPerson: Joi.string().max(100).allow("", null).optional().messages({
		"string.max": "Contact person name must not exceed 100 characters.",
	}),

	contactPhone: Joi.string().pattern(NEPAL_PHONE_PATTERN).required().messages({
		"string.empty": "Contact phone number is required.",
		"any.required": "Contact phone number is required.",
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),
});

export const updateOrgDTO = Joi.object({
	description: Joi.string().max(500).allow("", null).optional().messages({
		"string.max": "Description must not exceed 500 characters.",
	}),

	website: Joi.string().uri().allow("", null).optional().messages({
		"string.uri": "Please enter a valid website URL (e.g. https://example.com).",
	}),

	contactPerson: Joi.string().max(100).allow("", null).optional().messages({
		"string.max": "Contact person name must not exceed 100 characters.",
	}),

	contactPhone: Joi.string().pattern(NEPAL_PHONE_PATTERN).allow("", null).optional().messages({
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),

	address: Joi.string().max(200).allow("", null).optional().messages({
		"string.max": "Address must not exceed 200 characters.",
	}),
});
