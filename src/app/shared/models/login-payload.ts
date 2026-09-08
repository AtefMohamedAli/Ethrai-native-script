export class LoginPayload {
    public usernameOrEmail: string;
    public password: string;
    public countryCode?: string;
    public rememberme?: boolean;
}