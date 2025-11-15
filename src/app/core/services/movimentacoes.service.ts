// src/app/core/services/movimentacoes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Movimentacao,
  MovimentacaoRequest,
} from '../models/movimentacao.model';

@Injectable({ providedIn: 'root' })
export class MovimentacoesService {
  private readonly apiUrl = '/api/movimentacoes';

  constructor(private http: HttpClient) {}

  /** Lista todas as movimentações */
  findAll(): Observable<Movimentacao[]> {
    return this.http
      .get<Movimentacao[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /** Lista por período: /api/movimentacoes/periodo?inicio=...&fim=... */
  findByPeriodo(inicio: string, fim: string): Observable<Movimentacao[]> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);

    return this.http
      .get<Movimentacao[]>(`${this.apiUrl}/periodo`, { params })
      .pipe(catchError(this.handleError));
  }

  /** Cria uma nova movimentação de estoque */
  create(body: MovimentacaoRequest): Observable<Movimentacao> {
    return this.http
      .post<Movimentacao>(this.apiUrl, body)
      .pipe(catchError(this.handleError));
  }

  /** Exclui uma movimentação pelo ID */
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Erro na API de movimentações:', error);
    return throwError(
      () => new Error('Erro ao consultar a API de movimentações.')
    );
  }
}