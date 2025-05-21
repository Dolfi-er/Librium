export interface LoginDto {
  login: string
  password: string
}

export interface AuthResponseDto {
  token: string
  role: string
}