const Joi = require('joi');
const createError = require('http-errors');

const validatorHandler = ({
    schema
}) => ({

    before: async (handler, next) => {
        // console.log("eventjson",handler.event);
        let method =`${handler.event.requestContext.resourcePath.toLowerCase()}-${handler.event.requestContext.httpMethod.toLowerCase()}`;
        console.log("JOI Validation ", method);
        if (!schema || !(method in schema)) {
            return;
        }
        if (handler.event && 'body' in handler.event && handler.event.body) {
            try {
                await new Promise((resolve, reject) => {

                    Joi.validate(handler.event.body, schema[method], {
                        abortEarly: false
                    }, function (err, value) {

                        if (err) {
                            console.log(err);
                            let errorMessage = 'Invalid input';
                            if ('details' in err && err.details) {
                                errorMessage = err.details.map(d => d.message.replace(/"/g, '')).join('. ');
                            }
                            reject({
                                status: 400,
                                message: errorMessage
                            });
                        } else {
                            resolve(value);
                        }

                    });

                });
            } catch (er) {
                throw new createError(400, er.message);
            }
        }
        return;
    }
});

export default validatorHandler;