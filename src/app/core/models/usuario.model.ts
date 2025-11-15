// src/app/core/models/usuario.model.ts
export type Perfil = 'ADMIN' | 'CAIXA' | 'GERENTE';

export interface Usuario {
  id?: number;
  nome: string;              // ✅ usado no cadastro
  email: string;
  senha?: string;            // ✅ opcional no update
  perfil: Perfil;            // ✅ enum tipado
  ativo?: boolean;
}
