export interface Usuario {
    id: number;
    nombres: string;
    email: string;
    rol: "ADMIN" | "REGULAR"; // Asegurar los roles permitidos
    password: string;
    createdAt: string;
    updatedAt: string;
  }
  