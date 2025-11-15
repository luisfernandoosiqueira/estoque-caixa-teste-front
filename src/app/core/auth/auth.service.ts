import { Injectable } from '@angular/core';

export interface UsuarioLogado {
  nome: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'OPERADOR';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'usuarioLogado';

  login(email: string, senha: string): boolean {
    if (email === 'admin@empresa.com' && senha === 'admin') {
      const usuario: UsuarioLogado = { nome: 'Administrador', email, perfil: 'ADMINISTRADOR' };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
      return true;
    }

    if (email === 'operador@empresa.com' && senha === 'operador') {
      const usuario: UsuarioLogado = { nome: 'Operador', email, perfil: 'OPERADOR' };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  getUsuario(): UsuarioLogado | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as UsuarioLogado) : null;
  }

  getUserEmail(): string | null {
    return this.getUsuario()?.email ?? null;
  }

  getUserNome(): string | null {
    return this.getUsuario()?.nome ?? null;
  }

  getUserPerfil(): string | null {
    return this.getUsuario()?.perfil ?? null;
  }

  updateUsuario(parcial: Partial<UsuarioLogado>): void {
    const atual = this.getUsuario();
    if (atual) {
      const atualizado = { ...atual, ...parcial };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(atualizado));
    }
  }
}
