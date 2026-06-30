# ArquivoDoc Frontend

Interface web para o sistema de controle de empréstimo de documentos arquivísticos. Permite cadastrar documentos, registrar empréstimos, acompanhar prazos e registrar devoluções de forma visual e intuitiva.

## Tecnologias utilizadas

- HTML5
- CSS3 (com Bootstrap)
- JavaScript
- jQuery

## Estrutura do projeto
arquivodoc-frontend/
index.html    # estrutura da página (SPA)
styles.css    # estilização personalizada
scripts.js    # lógica e chamadas para a API

## Funcionalidades
- **Acervo**: visualização de todos os documentos cadastrados em cards, com cadastro e remoção
- **Empréstimos**: acompanhamento dos empréstimos ativos, com barra de prazo visual e registro de devolução
- **Registrar**: formulário para registrar a saída de um documento, com seleção de prazo personalizado

## Instalação

### 1. Clone o repositório
git clone https://github.com/seu-usuario/arquivodoc-frontend.git

### 2. Execute o back-end

Este front-end depende da API do ArquivoDoc Backend rodando em `http://127.0.0.1:5000`. Certifique-se de que o back-end está em execução antes de usar o front-end. Veja as instruções no repositório [arquivodoc-backend](https://github.com/seu-usuario/arquivodoc-backend).

### 3. Abra o front-end

Basta abrir o arquivo `index.html` diretamente no navegador — não é necessário instalar dependências ou rodar um servidor local.

**Observação:** caso o navegador bloqueie as chamadas para a API por restrições de segurança ao abrir arquivos locais, abra o Chrome com a flag abaixo:
chrome.exe --allow-file-access-from-files

