import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly apiUrl = '/api/usuarios';

  constructor(private http: HttpClient) {}

  /** Lista todos */
  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  /** Busca por ID */
  findById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /** Cria novo */
  create(body: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, body).pipe(catchError(this.handleError));
  }

  /** Atualiza existente */
  update(id: number, body: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, body).pipe(catchError(this.handleError));
  }

  /** Inativa usuário */
  inativar(id: number): Observable<Usuario> {
    return this.http
      .patch<Usuario>(`${this.apiUrl}/${id}/inativar`, {})
      .pipe(catchError(this.handleError));
  }

  /** Exclui usuário */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Erro na API de usuários:', error);
    return throwError(() => new Error('Erro ao consultar a API de usuários.'));
  }
}
