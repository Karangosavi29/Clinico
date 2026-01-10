class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors=[],
        stack=""
        
    ){
        super(message)
        this.statusCode =statusCode   // HTTP status code
        this.data =null                 // Optional payload (currently null)
        this.message=message             // Error message
        this.success=false;              // Indicates API failure
        this.errors=errors               // Array for field-specific errors


        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export {ApiError}