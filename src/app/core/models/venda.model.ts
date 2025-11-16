// src/app/core/models/venda.model.ts
import { Usuario } from './usuario.model';
import { ItemVenda } from './item-venda.model';

// Item da venda enviado no POST (ItemVendaRequestDTO)
export interface ItemVendaRequest {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

// Resposta da API (VendaResponseDTO)
export interface Venda {
  id?: number;
  dataHora?: string;          
  valorTotal: number;
  valorRecebido: number;
  troco: number;
  usuario: Usuario;
  itens: ItemVenda[];
}

// Corpo para criação de venda (VendaRequestDTO)
export interface VendaRequest {
  usuarioId: number;
  valorRecebido: number;
  itens: ItemVendaRequest[];
}
