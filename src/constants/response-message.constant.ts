export const responseMessage = {
    SOMETHING_WENT_WRONG: "Something Went Wrong",
    NOT_FOUND: function (entity: string) {
        return `${entity} not found`;
    },
};
