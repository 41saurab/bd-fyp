import Joi from "joi";

export const createCampaignDTO = Joi.object({
    title: Joi.string().required().label("title"),
    description: Joi.string().required().label("description"),
    type: Joi.string()
        .valid("regular", "emergency", "special")
        .optional()
        .label("type"),
    targetBloodTypes: Joi.alternatives()
        .try(Joi.array(), Joi.string())
        .optional()
        .label("targetBloodTypes"),
    targetUnits: Joi.number().optional().label("targetUnits"),
    startDate: Joi.date().required().label("startDate"),
    endDate: Joi.date().required().label("endDate"),
    venue: Joi.string().required().label("venue"),
    city: Joi.string().required().label("city"),
    address: Joi.string().allow("", null).optional().label("address"),
    pointsReward: Joi.number().optional().label("pointsReward"),
    requirements: Joi.string().allow("", null).optional().label("requirements"),
    contactInfo: Joi.string()
        .allow("", null)
        .optional()
        .label("contactInfo")
        .min(10)
        .max(10),
    tags: Joi.alternatives()
        .try(Joi.array(), Joi.string())
        .optional()
        .label("tags"),
});
