class ApiResponse{
  
  constructor(

    statuscode,
    data,
    message

  ){

    this.message=message;
    this.statuscode=statuscode;
    this.data=data;
    this.success=true;

  }
}

export default ApiResponse;