// src/app/core/models/item-venda.model.ts
import { Produto } from './produto.model';

export interface ItemVenda {
  id?: number;

  // produto retornado pela API na VendaResponseDTO
  produto?: Produto;

  // usado no envio (VendaRequestDTO)
  produtoId?: number;

  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}