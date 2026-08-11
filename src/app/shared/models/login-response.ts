export class LoginResponse{

  public success: boolean;
  public extraData:LoginExtraData;
  public errorCode:string;
     
}

export class LoginExtraData{
    public access_token: string;
    public expires_in: number;
    public token_type: string;
    public refresh_token:string;
    public tenants:any[];
}
