
# 💻 Frontend — Gestão de Funcionários e Departamentos

Aplicação **Angular 19** desenvolvida para consumo da API de **Gestão de Funcionários e Departamentos**, permitindo visualizar, cadastrar, editar, inativar e excluir registros de forma simples, responsiva e moderna.

---

## ⚙️ Tecnologias utilizadas

* **Angular 19 (standalone components)**
* **PrimeNG + Tema Aura Light**
* **TypeScript / HTML / SCSS**
* **RxJS + HttpClient**
* **Roteamento com Angular Router**

---

## 📚 Funcionalidades principais

### 👨‍💼 Funcionários

* Tela de **listagem** com filtros por cargo e status (ativo/inativo)
* **Cadastro e edição** com validações básicas
* **Seleção de data** via componente de calendário (`p-datepicker`)
* **Associação a um Departamento ativo**
* **Inativação e exclusão** com feedbacks visuais
* **Filtros dinâmicos** e busca manual

### 🏢 Departamentos

* Tela de **listagem** com filtro por status (ativo/inativo)
* **Cadastro e edição** de departamentos
* **Inativação de departamentos** sem exclusão física
* Integração direta com o cadastro de funcionários

### 🏠 Tela inicial

* Mensagem de boas-vindas
* **Atalhos rápidos** para cadastros e listagens
* Regras e dicas do sistema

---

## 📁 Estrutura do projeto

```
src/app/
 ├─ components/
 │   ├─ navbar/                    → Menu superior de navegação
 │   ├─ home/                      → Tela inicial
 │   ├─ cadastro-funcionario/      → Formulário de cadastro/edição de funcionários
 │   ├─ lista-funcionario/         → Listagem e filtros de funcionários
 │   ├─ cadastro-departamento/     → Formulário de cadastro/edição de departamentos
 │   └─ lista-departamento/        → Listagem e filtros de departamentos
 │
 ├─ service/
 │   ├─ funcionarios.service.ts    → Integração com API de funcionários
 │   └─ departamentos.service.ts   → Integração com API de departamentos
 │
 ├─ app.routes.ts                  → Rotas principais
 └─ app.component.*                → Componente raiz
```

---

## 🔗 Integração com o backend

* API de Funcionários: **[http://localhost:8080/api/funcionarios](http://localhost:8080/api/funcionarios)**
* API de Departamentos: **[http://localhost:8080/api/departamentos](http://localhost:8080/api/departamentos)**
* CORS liberado via `@CrossOrigin("*")` no backend
* Datas enviadas e exibidas no formato **`dd/MM/yyyy`**

---

## ▶️ Como executar o projeto

1. Certifique-se de ter o **Node.js 18+** e o **Angular CLI 19** instalados.

2. No terminal, dentro da pasta do projeto:

   ```bash
   npm install
   ng serve
   ```

3. Acesse o app em **[http://localhost:4200](http://localhost:4200)**

---

## 🧠 Observações

* O projeto utiliza **PrimeNG** para todos os componentes visuais (botões, tabelas, formulários e dropdowns).
* Os **comboboxes** de cargos e departamentos são dinâmicos e sincronizados com o backend.
* A interface segue o padrão **responsivo e moderno**, com ícones da biblioteca **PrimeIcons**.
* O **banco H2** é recriado a cada execução do backend, garantindo um ambiente limpo para testes.

---

> 🧩 Projeto acadêmico desenvolvido em conjunto com o backend **Gestão de Funcionários API (Spring Boot 3)** — módulo completo com **Departamentos integrados**, seguindo arquitetura REST e boas práticas de desenvolvimento Angular.

