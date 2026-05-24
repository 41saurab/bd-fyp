import Joi from "joi";

export const registerOrgDTO = Joi.object({
	name: Joi.string().min(2).max(100).required().label("name"),
	email: Joi.string().email().required().label("email"),
	password: Joi.string().min(6).required().label("password"),
	confirmPassword: Joi.string().valid(Joi.ref("password")).required().label("confirmPassword"),
	phone: Joi.string().allow("", null).optional().label("phone").min(10).max(10),
	orgName: Joi.string().required().label("orgName"),
	orgType: Joi.string().valid("hospital", "blood_bank", "clinic", "ngo", "other").required().label("orgType"),
	registrationNumber: Joi.string().length(9).pattern(/^\d+$/).required().label("registrationNumber").messages({
		"string.length": "PAN number must be exactly 9 digits",
		"string.pattern.base": "PAN number must contain only numbers",
	}),
	address: Joi.string().required().label("address"),
	city: Joi.string().required().label("city"),
	website: Joi.string().uri().allow("", null).optional().label("website"),
	description: Joi.string().allow("", null).optional().label("description"),
	contactPerson: Joi.string().allow("", null).optional().label("contactPerson"),
	contactPhone: Joi.string().allow("", null).optional().label("contactPhone"),
});

export const updateOrgDTO = Joi.object({
	description: Joi.string().allow("", null).optional().label("description"),
	website: Joi.string().uri().allow("", null).optional().label("website"),
	contactPerson: Joi.string().allow("", null).optional().label("contactPerson"),
	contactPhone: Joi.string().allow("", null).optional().label("contactPhone").min(10).max(10),
	address: Joi.string().allow("", null).optional().label("address"),
});
