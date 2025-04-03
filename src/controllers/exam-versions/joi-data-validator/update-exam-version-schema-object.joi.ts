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
    hasPaperSets: Joi.string().valid("YES", "NO").required(),
    hasSections: Joi.string().valid("YES", "NO").required(),
    examSections: Joi.array()
        .items(
            Joi.object({
                id: Joi.string().uuid().optional(),
                sectionName: Joi.string().required(),
                sectionDisplayId: Joi.number().required(),
                questions: Joi.array()
                    .items(
                        Joi.object({
                            id: Joi.string().uuid().optional(),
                            questionId: Joi.string().uuid().required(),
                            marks: Joi.number().default(1),
                            questionDisplayId: Joi.number().required(),
                        })
                    )
                    .required()
                    .min(1)
                    .unique("questionDisplayId"),
            })
        )
        .required()
        .min(1)
        .unique("sectionDisplayId"),
    examPaperSets: Joi.array()
        .items(
            Joi.object({
                questionPaperSetId: Joi.string().uuid().required(),
                sections: Joi.array()
                    .items(
                        Joi.object({
                            id: Joi.string().uuid().optional(),
                            sectionDisplayId: Joi.number().required(),
                            sectionOrder: Joi.number().required(),
                            questions: Joi.array()
                                .items(
                                    Joi.object({
                                        questionOrder: Joi.number().required(),
                                        questionDisplayId:
                                            Joi.number().required(),
                                    })
                                )
                                .required()
                                .min(1)
                                .unique("questionDisplayId"),
                        })
                    )
                    .required()
                    .min(1)
                    .unique("sectionDisplayId"),
            })
        )
        .required()
        .min(1)
        .unique("questionPaperSetId"),
});

export default updateExamVersionSchemaObject;
