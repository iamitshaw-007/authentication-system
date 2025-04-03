import Joi from "joi";

const createExamVersionSchemaObject = Joi.object({
    courseId: Joi.string().uuid().required(),
    languageId: Joi.string().uuid().required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
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
                sectionName: Joi.string().required(),
                sectionDisplayId: Joi.number().required(),
                questions: Joi.array()
                    .items(
                        Joi.object({
                            questionId: Joi.string().uuid().required(),
                            marks: Joi.number().default(1),
                            questionDisplayId: Joi.number().required(),
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
    examPaperSets: Joi.array()
        .items(
            Joi.object({
                questionPaperSetId: Joi.string().uuid().required(),
                sections: Joi.array()
                    .items(
                        Joi.object({
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
                                .unique("questionOrder"),
                        })
                    )
                    .required()
                    .min(1)
                    .unique("sectionOrder"),
            })
        )
        .required()
        .min(1)
        .unique("questionPaperSetId"),
});

export default createExamVersionSchemaObject;
