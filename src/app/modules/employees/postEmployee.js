import createHttpError from "http-errors";



export const post_employee = async (currentUser, body, client) => {
    //JWT validation for user
    //if you use JWT you can uncomment this code by accessing the currentUser from main function 
    // if(!currentUser){
    //     throw new createHttpError.Unauthorized("Unauthorized Access");
    // }
    if(!body){
        throw new createHttpError.BadRequest("Invalid Request");
    }
    try {
        let { employee_name,  employee_salary, employee_address, employee_manager} = body;
        let employee = await client.query({text:`insert into employee values($1,$2,$3,$4) returning id`,values:[employee_name,  employee_salary, employee_address, employee_manager]})
        if(!employee){
            throw new createHttpError.InternalServerError("Error occurred while creating employee");
        }
        return employee.rows
        
    } catch (error) {
        throw new createHttpError.InternalServerError(error);
    }
}