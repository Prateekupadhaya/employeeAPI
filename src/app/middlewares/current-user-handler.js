const createError = require("http-errors");
const jwt = require("jsonwebtoken");
import { getPayload } from '../common/utils'

const currentUserHandler = ({ auth_required }) => ({
  before: async (handler) => {
    let method = `${handler.event.requestContext.resourcePath.toLowerCase()}-${handler.event.requestContext.httpMethod.toLowerCase()}`;
    console.log(method);
    const {
      event: { headers, requestContext },
    } = handler;

    if (auth_required.includes(method)) {
      if (!headers || !headers.Authorization) {
        throw new createError.BadRequest("You are not authorised");
      }
    }
    if (headers && headers.Authorization) {
      const decoded = getPayload(headers.Authorization); 
      requestContext.currentUser = decoded;
      return;
    } 
    return;
  },
});

export default currentUserHandler;
