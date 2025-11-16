import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutosService {

  private readonly apiUrl = '/api/produtos';

  constructor(private http: HttpClient) {}

  /** Lista todos os produtos (com filtros opcionais) */
  findAll(filtros?: { categoria?: string; nome?: string }): Observable<Produto[]> {
    let params = new HttpParams();
    if (filtros?.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros?.nome) params = params.set('nome', filtros.nome);

    return this.http.get<Produto[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  findById(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** Criação de produto (POST) */
  create(body: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, body)
      .pipe(catchError(this.handleError));
  }

  /** Atualização de produto (PUT) */
  update(id: number, body: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, body)
      .pipe(catchError(this.handleError));
  }

  /** Exclusão de produto (DELETE) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Erro na API de produtos:', error); // log simples
    // repropaga o erro original para o componente tratar a mensagem do backend
    return throwError(() => error);
  }
}
