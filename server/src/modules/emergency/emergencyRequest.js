import Joi from "joi";

export const createEmergencyDTO = Joi.object({
	patientName: Joi.string().required().label("patientName"),
	bloodType: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required().label("bloodType"),
	unitsNeeded: Joi.number().required().label("unitsNeeded"),
	urgencyLevel: Joi.string().valid("critical", "urgent", "moderate").optional().label("urgencyLevel"),
	reason: Joi.string().required().label("reason"),
	location: Joi.string().required().label("location"),
	city: Joi.string().required().label("city"),
	contactPerson: Joi.string().required().label("contactPerson"),
	contactPhone: Joi.string().required().label("contactPhone").min(10).max(10),
	deadline: Joi.date().allow(null).optional().label("deadline"),
	additionalNotes: Joi.string().allow("", null).optional().label("additionalNotes"),
});
