import Joi from "joi";

const updateExamVersionSchemaObject = Joi.object({
    id: Joi.string().uuid().required(),
    courseId: Joi.string().uuid().required(),
    languageId: Joi.string().uuid().required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
    passingScore: Joi.number().required(),
    totalScore: Joi.number().required(),
    examInstructions: Joi.string().required(),
    examVersionName: Joi.string().required(),
    hasResourseBooklet: Joi.string().valid("Yes", "No").required(),
    resouseBookeletInformation: Joi.when("hasResourseBooklet", {
        is: "Yes",
        then: Joi.string().required(),
        otherwise: Joi.any().allow(null),
    }),
    hasPaperSets: Joi.string().valid("Yes", "No").required(),
    hasSections: Joi.string().valid("Yes", "No").required(),
    questionPaperSets: Joi.array()
        .items(
            Joi.object({
                questionPaperSetId: Joi.when("hasPaperSets", {
                    is: "Yes",
                    then: Joi.string().uuid().required(),
                    otherwise: Joi.string().valid("defaultPaparSet"),
                }),
                sections: Joi.array()
                    .items(
                        Joi.object({
                            sectionId: Joi.string().uuid().optional(),
                            sectionName: Joi.when("hasSections", {
                                is: "Yes",
                                then: Joi.string().required(),
                                otherwise: Joi.string()
                                    .valid("defaultSection")
                                    .required(),
                            }),
                            sectionOrder: Joi.number().required(),
                            questions: Joi.array()
                                .items(
                                    Joi.object({
                                        questionId: Joi.string()
                                            .uuid()
                                            .required(),
                                        questionOrder: Joi.number().required(),
                                        marks: Joi.number().default(1),
                                    })
                                )
                                .required()
                                .min(1)
                                .unique("questionId"),
                        })
                    )
                    .required()
                    .min(1)
                    .unique("sectionName"),
            })
        )
        .required()
        .min(1)
        .unique("questionPaperSetId"),
});

export default updateExamVersionSchemaObject;
