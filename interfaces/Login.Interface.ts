export interface Login {
    id: number;   
    status?: boolean;
    msg?: string;
    nombres: string;
    email: string;
    token: string;
    rol: string; // CAMBIO de tipoUsuario a rol
}


export interface ModuleUser {
    id: number;
    icon: string;
    title: string;
    value: string;
    path: string;
    checked: boolean;
    expanded: boolean;
    module_levels: ModuleLevel[];
}

export interface ModuleLevel {
    id: number;
    module_id: number;
    title: string;
    value: string;
    enabled: boolean;
    checked: boolean;
    path: string;
}
