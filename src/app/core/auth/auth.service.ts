// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface LoginResponse {
  nomeCompleto: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'OPERADOR';
}

export interface UsuarioLogado {
  nomeCompleto: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'OPERADOR';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'usuarioLogado';
  private readonly LOGIN_URL = '/api/login';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<UsuarioLogado> {
    return this.http
      .post<LoginResponse>(this.LOGIN_URL, { email, senha })
      .pipe(
        map((res) => {
          const usuario: UsuarioLogado = {
            nomeCompleto: res.nomeCompleto,
            email: res.email,
            perfil: res.perfil,
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
          return usuario;
        })
      );
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
    return this.getUsuario()?.nomeCompleto ?? null;
  }

  getUserPerfil(): 'ADMINISTRADOR' | 'OPERADOR' | null {
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
