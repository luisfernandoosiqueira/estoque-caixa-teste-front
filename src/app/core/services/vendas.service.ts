// src/app/core/services/vendas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Venda, VendaRequest } from '../models/venda.model';

@Injectable({ providedIn: 'root' })
export class VendasService {

  private readonly apiUrl = '/api/vendas';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Venda[]> {
    return this.http
      .get<Venda[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  findById(id: number): Observable<Venda> {
    return this.http
      .get<Venda>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  findByUsuario(usuarioId: number): Observable<Venda[]> {
    return this.http
      .get<Venda[]>(`${this.apiUrl}/usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }

  findByPeriodo(inicio: string, fim: string): Observable<Venda[]> {
    let params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);

    return this.http
      .get<Venda[]>(`${this.apiUrl}/periodo`, { params })
      .pipe(catchError(this.handleError));
  }

  // 🔹 Aqui está o ponto importante: usa VendaRequest no envio
  create(body: VendaRequest): Observable<Venda> {
    return this.http
      .post<Venda>(this.apiUrl, body)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Erro na API de vendas:', error);
    return throwError(() => new Error('Erro ao consultar a API de vendas.'));
  }
}