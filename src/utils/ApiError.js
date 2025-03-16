class ApirError extends Error{
    constructor(
        statusCode,
        message=" Something went wrong",
        errors = [],
        stack = ""
    ){
        // whenever we override we call super
        super(message)
        this.statusCode = statusCode
        this.data = null,
        this.message = message,
        this.success = false,
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApirError}