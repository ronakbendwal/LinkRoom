class ApiError extends Error{

  constructor(

    statuscode,
    message,
    errors=[],
    stack=""

  ){

    super(message);
    this.statusCode=statuscode;
    this.success=false;
    this.message=message
    this.data=null;
    this.errors=errors

    if(stack){

      this.stack=stack;

    }else{

      Error.captureStackTrace(this,this.constructor);

    }
  }
}

export default ApiError