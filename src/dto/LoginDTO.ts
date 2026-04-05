export class LoginDTO {
  username: string
  password: string
  constructor(user: string, password: string) {
    this.username = user
    this.password = password
  }
  static generateIncorrectPair(): LoginDTO {
    return new LoginDTO("", "")
  }
  static generateCorrectPair(): LoginDTO{
    return new LoginDTO(
      process.env.USER || "missing user",
      process.env.PASSWORD || "missing password"
    )}
}