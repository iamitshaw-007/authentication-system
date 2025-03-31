import Joi from "joi";

const updateExamVersionSchemaObject = Joi.object({
    id: Joi.string().uuid().required(),
    courseId: Joi.string().uuid().required(),
    languageId: Joi.string().uuid().required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
    passingScore: Joi.number().required(),
    totalScore: Joi.number().required(),
    examInstructions: Joi.string().required(),
    examVersionName: Joi.string().required(),
    hasResourseBooklet: Joi.string().valid("YES", "NO").required(),
    resourseBookletInformation: Joi.when("hasResourseBooklet", {
        is: "YES",
        then: Joi.string().required(),
        otherwise: Joi.any().allow(null),
    }),
    hasQuestionSets: Joi.string().valid("YES", "NO").required(),
    hasSections: Joi.string().valid("YES", "NO").required(),
    examPaperSets: Joi.array()
        .items(
            Joi.object({
                questionPaperSetId: Joi.string().uuid().required(),
                sections: Joi.array()
                    .items(
                        Joi.object({
                            sectionId: Joi.string().uuid().optional(),
                            sectionName: Joi.string().required(),
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
