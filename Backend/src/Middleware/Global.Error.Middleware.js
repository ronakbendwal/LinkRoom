const ErrorMiddleware=(err,req,res,next)=>{

const statusCode=err.statusCode;

const message=err.message;

return res.status(statusCode)

.json({

  message:message,

  success:false

})}

export default ErrorMiddleware;