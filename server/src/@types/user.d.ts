export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
} 