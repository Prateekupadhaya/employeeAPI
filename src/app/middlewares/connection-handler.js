const pg = require('pg');
const createError = require('http-errors');

const connectionHandler = () => ({
    before: async(handler, next) => {
        let params = {
            host: process.env.db_host,
            user: process.env.db_username,
            password: process.env.db_password,
            database: process.env.db_database
        };
        try{
            let client = new pg.Client(params);
            await client.connect();
            console.log("connection established");
            handler.context.client = client; 
        }
        catch(e){
            throw new createError.InternalServerError(e);
        }
        return;
    },

    after: async(handler) => {
        if(handler.context && handler.context.client){
            try{
                console.log("Releasing connection");
                handler.context.client.end();
            }
            catch(e){
                throw new createError.InternalServerError(e);
            }
        }
        return;
    }

});

export default connectionHandler;
  