// Respuesta genérica al obtener lista de personajes
export interface GetPersonajesResponse {
    statusCode: number;
    msg: string;
    data: Personaje[];
    success: boolean;
  }
  
  export interface Personaje {
    id: number;
    nombre: string;
    foto: string;
    especie: string;
    genero: string;
    estado: string;
    origen: string;
    tipo: string;
    flag?: boolean;
    idUsuario?: number; // 👈 Agregar esta línea
    createdAt?: string;
    updatedAt?: string;
  }
  
  