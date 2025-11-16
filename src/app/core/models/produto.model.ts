export interface Produto {
  id?: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidadeEstoque: number;
  precoUnitario: number;
  ativo?: boolean;
}
