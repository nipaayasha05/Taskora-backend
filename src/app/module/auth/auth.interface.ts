export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}
