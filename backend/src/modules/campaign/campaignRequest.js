import Joi from "joi";

const NEPAL_PHONE_PATTERN = /^(97|98)\d{8}$/;

export const createCampaignDTO = Joi.object({
	title: Joi.string().min(3).max(150).required().messages({
		"string.empty": "Campaign title is required.",
		"any.required": "Campaign title is required.",
		"string.min": "Campaign title must be at least 3 characters.",
		"string.max": "Campaign title must not exceed 150 characters.",
	}),

	description: Joi.string().min(10).required().messages({
		"string.empty": "Campaign description is required.",
		"any.required": "Campaign description is required.",
		"string.min": "Please provide a more detailed description (at least 10 characters).",
	}),

	type: Joi.string().valid("regular", "emergency", "special").optional().messages({
		"any.only": "Campaign type must be regular, emergency, or special.",
	}),

	targetBloodTypes: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),

	targetUnits: Joi.number().min(1).max(10000).optional().messages({
		"number.min": "Target units must be at least 1.",
		"number.max": "Target units seems unrealistically high — please verify.",
	}),

	startDate: Joi.date().min("now").required().messages({
		"date.base": "Start date is required.",
		"any.required": "Start date is required.",
		"date.min": "Start date cannot be in the past.",
	}),

	endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
		"date.base": "End date is required.",
		"any.required": "End date is required.",
		"date.greater": "End date must be after the start date.",
	}),

	venue: Joi.string().max(200).required().messages({
		"string.empty": "Venue is required.",
		"any.required": "Venue is required.",
		"string.max": "Venue must not exceed 200 characters.",
	}),

	city: Joi.string().max(50).required().messages({
		"string.empty": "City is required.",
		"any.required": "City is required.",
		"string.max": "City name must not exceed 50 characters.",
	}),

	address: Joi.string().max(200).allow("", null).optional().messages({
		"string.max": "Address must not exceed 200 characters.",
	}),

	pointsReward: Joi.number().min(1).optional().messages({
		"number.min": "Points reward must be at least 1.",
	}),

	requirements: Joi.string().allow("", null).optional(),

	contactInfo: Joi.string().pattern(NEPAL_PHONE_PATTERN).allow("", null).optional().messages({
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),

	tags: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),

	latitude: Joi.number().min(-90).max(90).allow(null).optional().label("latitude"),
	longitude: Joi.number().min(-180).max(180).allow(null).optional().label("longitude"),
});

export const updateCampaignDTO = Joi.object({
	title: Joi.string().min(3).max(150).optional().messages({
		"string.min": "Campaign title must be at least 3 characters.",
		"string.max": "Campaign title must not exceed 150 characters.",
	}),
	description: Joi.string().min(10).optional().messages({
		"string.min": "Please provide a more detailed description (at least 10 characters).",
	}),
	type: Joi.string().valid("regular", "emergency", "special").optional(),
	targetBloodTypes: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
	targetUnits: Joi.number().min(1).max(10000).optional(),
	startDate: Joi.date().optional(),
	endDate: Joi.date().optional(),
	venue: Joi.string().max(200).optional(),
	city: Joi.string().max(50).optional(),
	address: Joi.string().max(200).allow("", null).optional(),
	pointsReward: Joi.number().min(1).optional(),
	requirements: Joi.string().allow("", null).optional(),
	contactInfo: Joi.string().pattern(NEPAL_PHONE_PATTERN).allow("", null).optional().messages({
		"string.pattern.base": "Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).",
	}),
	tags: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
	latitude: Joi.number().min(-90).max(90).allow(null).optional().label("latitude"),
	longitude: Joi.number().min(-180).max(180).allow(null).optional().label("longitude"),
});
