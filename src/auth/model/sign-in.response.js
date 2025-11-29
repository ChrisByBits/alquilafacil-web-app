export class SignInResponse {
  constructor(id, username, token, refreshToken) {
    this.id = id;
    this.username = username;
    this.token = token;
    this.refreshToken = refreshToken;
  }
}