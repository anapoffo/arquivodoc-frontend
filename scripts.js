// URL base da API
const API_URL = "http://127.0.0.1:5000";

// ===== EXIBIR NOTIFICAÇÃO (TOAST) =====
function mostrarToast(mensagem, tipo) {
    const cor = tipo === 'erro' ? '#dc3545' : '#198754';
    const icone = tipo === 'erro' ? 'bi-x-circle' : 'bi-check-circle';

    const toast = $(`
        <div style="background:${cor}; color:white; padding:12px 18px; border-radius:8px; margin-bottom:10px; box-shadow:0 4px 12px rgba(0,0,0,0.15); display:flex; align-items:center; gap:8px; min-width:250px; opacity:0;">
            <i class="bi ${icone}"></i>
            <span>${mensagem}</span>
        </div>
    `);

    $('#toast-container').append(toast);
    toast.animate({ opacity: 1 }, 200);

    setTimeout(function() {
        toast.animate({ opacity: 0 }, 300, function() {
            toast.remove();
        });
    }, 3000);
}

// Prazo selecionado (padrão 7 dias)
let prazoSelecionado = 7;

// ===== INICIALIZAÇÃO =====
$(document).ready(function() {
    carregarDocumentos();
    carregarEmprestimos();
});

// ===== NAVEGAÇÃO ENTRE ABAS =====
function mostrarAba(aba) {
    // esconde todas as seções
    $('.secao').hide();
    // remove active de todas as abas
    $('.nav-link').removeClass('active');

    // mostra a seção correta
    $('#secao-' + aba).show();

    // marca a aba correta como active
    $('.nav-link[onclick="mostrarAba(\'' + aba + '\')"]').addClass('active');

    // recarrega os dados ao trocar de aba
    if (aba === 'acervo') carregarDocumentos();
    if (aba === 'emprestimos') carregarEmprestimos();
    if (aba === 'registrar') carregarDocumentosDisponiveis();
}

// ===== CARREGAR DOCUMENTOS =====
function carregarDocumentos() {
    $.get(API_URL + '/documentos', function(data) {
        const documentos = data.documentos;
        const lista = $('#lista-documentos');
        lista.empty();

        // atualiza o card de resumo
        $('#total-documentos').text(documentos.length);

        if (documentos.length === 0) {
            lista.html('<p class="text-muted">Nenhum documento cadastrado ainda.</p>');
            return;
        }

        documentos.forEach(function(doc) {
            lista.append(criarCardDocumento(doc));
        });
    });
}

// ===== CRIAR CARD DE DOCUMENTO =====
function criarCardDocumento(doc) {
    // define o badge de status
    let badge = '';
    if (doc.status === 'disponivel') {
        badge = '<span class="badge-disponivel">Disponível</span>';
    } else if (doc.status === 'emprestado') {
        badge = '<span class="badge-emprestado">Emprestado</span>';
    } else {
        badge = '<span class="badge-atrasado">Atrasado</span>';
    }

    // define os botões de ação
    let btnEmprestar = '';
    if (doc.status === 'disponivel') {
        btnEmprestar = `<button class="btn btn-outline-primary btn-sm" onclick="irParaEmprestimo(${doc.id}, '${doc.titulo}')">
                            <i class="bi bi-arrow-right"></i> Emprestar
                        </button>`;
    } else {
        btnEmprestar = `<button class="btn btn-outline-secondary btn-sm" disabled>Em uso</button>`;
    }

    return `
        <div class="col-md-4">
            <div class="card-documento">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="card-numero-processo">${doc.numero_processo}</span>
                    ${badge}
                </div>
                <div class="fw-500 mb-1">${doc.titulo}</div>
                <div class="card-meta"><i class="bi bi-folder"></i> ${doc.fundo || '—'}</div>
                <div class="card-meta"><i class="bi bi-geo-alt"></i> ${doc.localizacao || '—'}</div>
                <div class="card-meta"><i class="bi bi-file-earmark"></i> ${doc.suporte || '—'}</div>
                <div class="card-acoes">
                    ${btnEmprestar}
                    <button class="btn btn-outline-danger btn-sm" onclick="deletarDocumento(${doc.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>`;
}

// ===== CARREGAR EMPRÉSTIMOS =====
function carregarEmprestimos() {
    $.get(API_URL + '/emprestimos', function(data) {
        const emprestimos = data.emprestimos;
        const lista = $('#lista-emprestimos');
        lista.empty();

        // conta atrasados para o resumo
        let atrasados = 0;
        emprestimos.forEach(function(emp) {
            if (emp.atrasado) atrasados++;
        });

        $('#total-emprestimos').text(emprestimos.length);
        $('#total-atrasados').text(atrasados);

        if (emprestimos.length === 0) {
            lista.html('<p class="text-muted">Nenhum empréstimo ativo no momento.</p>');
            return;
        }

        emprestimos.forEach(function(emp) {
            lista.append(criarCardEmprestimo(emp));
        });
    });
}

// ===== CRIAR CARD DE EMPRÉSTIMO =====
function criarCardEmprestimo(emp) {
    // iniciais do solicitante para o avatar
    const iniciais = emp.solicitante.split(' ').map(n => n[0]).slice(0, 2).join('');

    // cor e texto da barra de prazo
    let corBarra = '#28a745';
    let textoPrazo = `faltam ${emp.dias_restantes} dia(s)`;
    let larguraBarra = Math.min(100, Math.max(0, ((emp.prazo_dias - emp.dias_restantes) / emp.prazo_dias) * 100));

    if (emp.atrasado) {
        corBarra = '#dc3545';
        textoPrazo = `atrasado há ${Math.abs(emp.dias_restantes)} dia(s)`;
        larguraBarra = 100;
    } else if (emp.dias_restantes <= 2) {
        corBarra = '#f0a500';
    }

    const dataClass = emp.atrasado ? 'emp-atrasado' : '';

    return `
        <div class="card-emprestimo">
            <div class="d-flex align-items-center gap-3">
                <div class="emp-avatar">${iniciais}</div>
                <div class="flex-grow-1">
                    <div class="emp-nome">${emp.solicitante}</div>
                    <div class="emp-info"><i class="bi bi-file-text"></i> ${emp.documento_titulo}</div>
                    <div class="emp-info"><i class="bi bi-building"></i> ${emp.setor || '—'}</div>
                </div>
                <div class="emp-datas">
                    <div>Saída: ${emp.data_saida}</div>
                    <div>Prazo: ${emp.prazo_dias} dias</div>
                    <div class="${dataClass}">Previsto: ${emp.data_prevista} ${emp.atrasado ? '⚠' : ''}</div>
                </div>
            </div>
            <div class="prazo-bar-wrap">
                <div class="prazo-label-bar">
                    <span>Prazo</span>
                    <span style="color:${corBarra}">${textoPrazo}</span>
                </div>
                <div class="prazo-bar-bg">
                    <div class="prazo-bar" style="width:${larguraBarra}%; background:${corBarra}"></div>
                </div>
            </div>
            <button class="btn btn-outline-success btn-sm w-100 mt-3" onclick="registrarDevolucao(${emp.id})">
                <i class="bi bi-check-circle"></i> Registrar devolução
            </button>
        </div>`;
}

// ===== CARREGAR DOCUMENTOS DISPONÍVEIS (para o select) =====
function carregarDocumentosDisponiveis() {
    $.get(API_URL + '/documentos', function(data) {
        const select = $('#select-documento');
        select.empty();
        select.append('<option value="">Selecione um documento disponível...</option>');

        data.documentos.forEach(function(doc) {
            if (doc.status === 'disponivel') {
                select.append(`<option value="${doc.id}">${doc.numero_processo} — ${doc.titulo}</option>`);
            }
        });
    });
}

// ===== ABRIR MODAL DE DOCUMENTO =====
function abrirModalDocumento() {
    // limpa os campos do modal
    $('#modal-numero-processo').val('');
    $('#modal-titulo').val('');
    $('#modal-fundo').val('');
    $('#modal-localizacao').val('');
    $('#modal-ano-inicial').val('');
    $('#modal-ano-final').val('');
    $('#modal-suporte').val('Papel');

    // abre o modal
    const modal = new bootstrap.Modal(document.getElementById('modalDocumento'));
    modal.show();
}

// ===== CADASTRAR DOCUMENTO =====
function cadastrarDocumento() {
    const dados = {
        numero_processo: $('#modal-numero-processo').val(),
        titulo: $('#modal-titulo').val(),
        fundo: $('#modal-fundo').val(),
        suporte: $('#modal-suporte').val(),
        localizacao: $('#modal-localizacao').val(),
        ano_inicial: parseInt($('#modal-ano-inicial').val()) || null,
        ano_final: parseInt($('#modal-ano-final').val()) || null
    };

    if (!dados.numero_processo || !dados.titulo) {
        mostrarToast('Número do processo e título são obrigatórios!', 'erro');
        return;
    }

    $.ajax({
        url: API_URL + '/documento',
        method: 'POST',
        data: dados,
        success: function() {
            bootstrap.Modal.getInstance(document.getElementById('modalDocumento')).hide();
            carregarDocumentos();
            mostrarToast('Documento cadastrado com sucesso!', 'sucesso');
        },
        error: function(xhr) {
            const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao cadastrar documento.';
            mostrarToast(msg, 'erro');
        }
    });
}

// ===== DELETAR DOCUMENTO =====
function deletarDocumento(id) {
    if (!confirm('Tem certeza que deseja remover este documento?')) return;

    $.ajax({
        url: API_URL + '/documento?id=' + id,
        method: 'DELETE',
        success: function() {
            carregarDocumentos();
            mostrarToast('Documento removido com sucesso!', 'sucesso');
        },
        error: function(xhr) {
            const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao deletar documento.';
            mostrarToast(msg, 'erro');
        }
    });
}

// ===== IR PARA ABA REGISTRAR =====
function irParaEmprestimo(id, titulo) {
    mostrarAba('registrar');
    carregarDocumentosDisponiveis();
    setTimeout(function() {
        $('#select-documento').val(id);
    }, 300);
}

// ===== SELECIONAR PRAZO =====
function selecionarPrazo(btn, dias) {
    $('.btn-prazo').removeClass('selecionado');
    $(btn).addClass('selecionado');
    prazoSelecionado = dias;
}

// ===== REGISTRAR EMPRÉSTIMO =====
function registrarEmprestimo() {
    const documentoId = $('#select-documento').val();
    const solicitante = $('#input-solicitante').val();
    const setor = $('#input-setor').val();

    if (!documentoId || !solicitante) {
        mostrarToast('Selecione um documento e informe o nome do solicitante!', 'erro');
        return;
    }

    $.ajax({
        url: API_URL + '/emprestimo',
        method: 'POST',
        data: {
            documento_id: documentoId,
            solicitante: solicitante,
            setor: setor,
            prazo_dias: prazoSelecionado
        },
        success: function() {
            mostrarToast('Empréstimo registrado com sucesso!', 'sucesso');
            $('#input-solicitante').val('');
            $('#input-setor').val('');
            mostrarAba('emprestimos');
        },
        error: function(xhr) {
            const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao registrar empréstimo.';
            mostrarToast(msg, 'erro');
        }
    });
}

// ===== REGISTRAR DEVOLUÇÃO =====
function registrarDevolucao(id) {
    if (!confirm('Confirmar devolução deste documento?')) return;

    $.ajax({
        url: API_URL + '/devolucao',
        method: 'PUT',
        data: { id: id },
        success: function() {
            carregarEmprestimos();
            carregarDocumentos();
            mostrarToast('Devolução registrada com sucesso!', 'sucesso');
        },
        error: function(xhr) {
            const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao registrar devolução.';
            mostrarToast(msg, 'erro');
        }
    });
}