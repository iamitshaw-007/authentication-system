import Joi from "joi";

const updateQuestionSchemaObject = Joi.object({
    id: Joi.string().uuid().required(),
    courseId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
    questionTypeId: Joi.string().uuid().required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
    topic: Joi.string().max(64).optional(),
    difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD").required(),
    tags: Joi.array().items(Joi.string().uuid()).unique(),
    questionVersions: Joi.array()
        .items(
            Joi.object({
                id: Joi.string().uuid().optional(),
                languageId: Joi.string().uuid().required(),
                questionText: Joi.string().required(),
                questionTypeId: Joi.string().uuid().required(),
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
        .unique("languageId"),
});

export default updateQuestionSchemaObject;
