export interface Role {
  id: number;
  name: string;
}

export interface Info {
  fio: string;
  phone: string;
  ticketNumber?: string;
  birthday?: string;
  education?: string;
  hallId?: number;
}

export interface User {
  id: number;
  login: string;
  role: Role;
  info: Info;
  password?: string; // Только для создания/обновления
}

// DTO для создания пользователя
export interface UserCreateDto {
  login: string;
  password: string;
  roleId: number;
  fio: string;
  phone: string;
  ticketNumber?: string;
  birthday?: string;
  education?: string;
  hallId?: number;
}

// DTO для обновления пользователя
export interface UserUpdateDto {
  login?: string;
  password?: string;
  fio?: string;
  phone?: string;
  ticketNumber?: string | null;
  birthday?: string | null;
  education?: string | null;
  hallId?: number | null;
}