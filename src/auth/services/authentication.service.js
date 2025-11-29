import http from "@/shared/services/http-common.js";

export class AuthenticationService {
  async signIn(signInRequest) {
    const response = await http.post('/authentication/sign-in', signInRequest);
    return response.data;
  }

  async signUp(signUpRequest) {
    return await http.post('/authentication/sign-up', signUpRequest);
  }

  async refreshToken(refreshToken) {
    const response = await http.post('/authentication/refresh', { refreshToken });
    return response.data;
  }
}