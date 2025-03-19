import Joi from "joi";

const createQuestionSchemaObject = Joi.object({
    subjectsId: Joi.string().uuid().required(),
    questionTypesId: Joi.string().uuid().required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
    topic: Joi.string().max(64).optional(),
    difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD").required(),
    tags: Joi.array().items(Joi.string().uuid()).unique(),
    languageVersions: Joi.array()
        .items(
            Joi.object({
                languagesId: Joi.string().uuid().required(),
                questionText: Joi.string().required(),
                questionTypesId: Joi.string().uuid().required(),
                questionType: Joi.string()
                    .valid(
                        "NUMERIC",
                        "MULTIPLE_CHOICE",
                        "FILL_IN_THE_BLANK",
                        "DESCRIPTIVE"
                    )
                    .required(),
                multipleChoiceOptions: Joi.when("questionType", {
                    is: "MULTIPLE_CHOICE",
                    then: Joi.object()
                        .pattern(
                            Joi.string().valid("A", "B", "C", "D", "E", "F"),
                            Joi.string().required()
                        )
                        .min(2)
                        .max(6)
                        .required(),
                    otherwise: Joi.any().allow(null),
                }),
                multipleChoiceAnswer: Joi.when("questionType", {
                    is: "MULTIPLE_CHOICE",
                    then: Joi.string()
                        .valid("A", "B", "C", "D", "E", "F")
                        .required(),
                    otherwise: Joi.any().allow(null),
                }),
                numericAnswer: Joi.when("questionType", {
                    is: "NUMERIC",
                    then: Joi.number().required(),
                    otherwise: Joi.any().allow(null),
                }),
                fillInTheBlankAnswer: Joi.when("questionType", {
                    is: "FILL_IN_THE_BLANK",
                    then: Joi.string().required(),
                    otherwise: Joi.any().allow(null),
                }),
                descriptiveAnswer: Joi.when("questionType", {
                    is: "DESCRIPTIVE",
                    then: Joi.string().required(),
                    otherwise: Joi.any().allow(null),
                }),
            })
        )
        .required()
        .min(1)
        .unique("languagesId"),
});

export default createQuestionSchemaObject;
