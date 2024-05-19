const middy = require("middy");
const createError = require("http-errors");

import {
    HttpError
} from "http-errors";
import { fetch_employee } from "./getEmployee";
import { post_employee } from "./postEmployee";


const {
    doNotWaitForEmptyEventLoop,
    cors,
    jsonBodyParser,
    warmup,
} = require("middy/middlewares");

const {
    connectionHandler,
    currentUserHandler
} = require("../../middlewares");

//uncomment when you use JWT token 
// const auth_required = ["/employee-get","/employee-post"];

const schema = {
    "/employee-post": Joi.object().keys({
        employee_name: Joi.string().required(),
        employee_salary: Joi.number().required(),
        employee_address: Joi.string().required(),
        employee_manager: Joi.string().required(),
    }),
}

const requestHandler = {
    //if you use JWT
    // "/employee-get": async({ currentUser, queryStringParameters, client, pathParameters}) =>
    //     fetch_employee(currentUser, queryStringParameters, client),
    "/employee-get": async({  queryStringParameters, client, pathParameters}) =>
        fetch_employee( queryStringParameters, client, pathParameters),
    "/employee-post": async({ request, client }) => 
        post_employee( request, client )
};

const handle = async (event, context) => {
    const {
        requestContext,
        body,
        pathParameters,
        queryStringParameters,
    } = event;
    const {
        httpMethod,
        resourcePath,
        currentUser
    } = requestContext;

    console.log('master');
    let client = null;
    if (context) {
        client = context.client;
    } else {
        throw new createError.InternalServerError(
            "Database connection couldn't be established"
        );
    }

    let responseCode, response;
    try {
        responseCode = 200;
        let key = `${resourcePath.toLowerCase()}-${httpMethod.toLowerCase()}`;
        if (!(key in requestHandler)) {
            console.log(key);
            throw new createError(400, "Method not supported");
        }
        response = await requestHandler[key]({
            ...pathParameters,
            queryStringParameters,
            request: body,
            pathParameters,
            requestContext,
            currentUser,
            client
        });
    } catch (e) {
        console.log(e);
        if (!(e instanceof HttpError)) {
            throw new createError.InternalServerError(e);
        } else {
            throw e;
        }
    }

    return {
        statusCode: responseCode,
        body: response,
    };
};

const handler = middy(handle)
    .use(warmup())
    .use(doNotWaitForEmptyEventLoop())
    .use(
        cors({
            headers: "*",
            credentials: true,
            origin: "*",
        })
    )
    .use(jsonBodyParser())
    .use(currentUserHandler({
        auth_required
    }))
    .use(validatorHandler({
        schema: schema
    }))
    .use(connectionHandler())

export default handler;