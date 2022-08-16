


export const fetch_employee = async (currentUser, queryStringParameters, client, pathParameters) => {
    //JWT validation for user
    //if you use JWT you can uncomment this code by accessing the currentUser from main function 
    // if(!currentUser){
    //     throw new createHttpError.Unauthorized("Unauthorized Access");
    // }
    try {
        let employeeData = await client.query({text:'select * from employee'});
        if(employeeData && employeeData.rows && employeeData.rows.length > 0){
            return employeeData.rows
        }
        return []
        
    } catch (error) {
        throw new createHttpError.InternalServerError(error);
    }
}