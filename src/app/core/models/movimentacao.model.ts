// src/app/core/models/movimentacao.model.ts
import { Produto } from './produto.model';

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface Movimentacao {
  id?: number;
  produto: Produto;         
  tipo: TipoMovimentacao;
  quantidade: number;
  dataHora?: string;
  motivo?: string;           
}

/** DTO usado para criar movimentações (requisição) */
export interface MovimentacaoRequest {
  produtoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo?: string;           
}
