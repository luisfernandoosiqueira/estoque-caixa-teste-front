// src/app/core/models/usuario.model.ts

export type Perfil = 'ADMINISTRADOR' | 'OPERADOR';

// Model usado para CRUD de usuários
export interface Usuario {
  id?: number;
  nomeCompleto: string;   
  email: string;
  senha?: string;
  perfil: Perfil;
  ativo?: boolean;
}


export interface UsuarioLogado {
  nomeCompleto: string;
  email: string;
  perfil: Perfil;
}
