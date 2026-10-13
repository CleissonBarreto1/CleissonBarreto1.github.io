// Envia por e-mail, ao lead, um relatorio com o perfil de investidor,
// as respostas dadas no quiz e a carteira padrao recomendada pela Suno.
//
// Dispara automaticamente a cada nova resposta do Google Form
// "Informacoes clientes" (conta institucional Suno).
//
// CONFIGURACAO (uma unica vez):
// 1. Abra a planilha de respostas do formulario (conta institucional Suno)
// 2. Menu Extensoes > Apps Script
// 3. Apague o codigo de exemplo e cole este arquivo inteiro
// 4. Salve o projeto (icone de disquete)
// 5. No menu lateral, clique no icone de relogio (Acionadores/Triggers)
// 6. "+ Adicionar acionador":
//    - Funcao a executar: onFormSubmitSendReport
//    - Fonte do evento: Do app de planilhas (From spreadsheet)
//    - Tipo de evento: Ao enviar o formulario (On form submit)
//    - Salvar
// 7. O Google vai pedir autorizacao na primeira execucao - aprove com a
//    conta institucional Suno (e ela quem vai aparecer como remetente)
// 8. Teste enviando uma resposta de teste pela pagina e confira a caixa
//    de entrada do e-mail usado no teste

var ALOCACOES = {
  conservador: {
    nomeExibicao: 'Conservador',
    tagline: 'Prioriza estabilidade e baixa oscilação',
    itens: [
      ['Renda fixa', '93,5%'],
      ['Ações', '2,7%'],
      ['FIIs', '1,8%'],
      ['Internacional', '1,0%'],
      ['Alternativo', '1,0%'],
    ],
  },
  dinamico: {
    nomeExibicao: 'Dinâmico',
    tagline: 'Equilíbrio entre segurança e crescimento',
    itens: [
      ['Renda fixa', '78,1%'],
      ['Ações', '8,1%'],
      ['FIIs', '5,4%'],
      ['Internacional', '5,6%'],
      ['Alternativo', '2,7%'],
    ],
  },
  sofisticado: {
    nomeExibicao: 'Sofisticado',
    tagline: 'Aceita mais oscilação para crescer mais',
    itens: [
      ['Renda fixa', '36,8%'],
      ['Ações', '22,1%'],
      ['FIIs', '14,8%'],
      ['Internacional', '18,9%'],
      ['Alternativo', '7,4%'],
    ],
  },
};

function onFormSubmitSendReport(e) {
  var valores = e.namedValues;
  var nome = pegarValor(valores, 'Nome');
  var email = pegarValor(valores, 'Email');
  var perfilTexto = pegarValor(valores, 'Perfil');
  var respostas = pegarValor(valores, 'Respostas detalhadas');

  var chavePerfil = normalizarChavePerfil(perfilTexto);
  var alocacao = ALOCACOES[chavePerfil];

  if (!email || !alocacao) {
    Logger.log('Envio ignorado: email="%s" perfil="%s"', email, perfilTexto);
    return;
  }

  var html = montarEmailHtml(nome, alocacao, respostas);

  GmailApp.sendEmail(email, 'Seu perfil de investidor Suno: ' + alocacao.nomeExibicao, '', {
    htmlBody: html,
    name: 'Suno',
  });
}

// Procura uma chave em namedValues ignorando ":" e maiúsculas/minúsculas,
// porque o título exato da pergunta no Forms pode variar (ex: "Nome" vs "Nome:").
function pegarValor(namedValues, chaveBase) {
  var alvo = chaveBase.trim().toLowerCase();
  var chaves = Object.keys(namedValues);
  for (var i = 0; i < chaves.length; i++) {
    var normalizada = chaves[i].replace(/:$/, '').trim().toLowerCase();
    if (normalizada === alvo) {
      return namedValues[chaves[i]][0] || '';
    }
  }
  return '';
}

var MAPA_ACENTOS = {
  'a': 'aàáâãä',
  'e': 'eèéêë',
  'i': 'iìíîï',
  'o': 'oòóôõö',
  'u': 'uùúûü',
  'c': 'cç',
};

function normalizarChavePerfil(perfilTexto) {
  var texto = String(perfilTexto).trim().toLowerCase();
  var resultado = '';
  for (var i = 0; i < texto.length; i++) {
    var ch = texto.charAt(i);
    var substituto = ch;
    for (var letraBase in MAPA_ACENTOS) {
      if (MAPA_ACENTOS[letraBase].indexOf(ch) !== -1) {
        substituto = letraBase;
        break;
      }
    }
    resultado += substituto;
  }
  return resultado;
}

function montarEmailHtml(nome, alocacao, respostas) {
  var linhasAlocacao = alocacao.itens
    .map(function (item) {
      return (
        '<tr>' +
        '<td style="padding:10px 0;border-bottom:1px solid #eee;color:#1A1A1A;">' +
        item[0] +
        '</td>' +
        '<td style="padding:10px 0;border-bottom:1px solid #eee;color:#1A1A1A;text-align:right;font-weight:700;">' +
        item[1] +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  var linhasRespostas = respostas
    ? respostas
        .split('\n')
        .map(function (linha) {
          return '<p style="margin:0 0 8px;color:#444;font-size:13px;">' + escapeHtml(linha) + '</p>';
        })
        .join('')
    : '';

  return (
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">' +
    '<div style="border-top:4px solid #C41F1F;padding:24px 0 16px;">' +
    '<span style="letter-spacing:4px;color:#C41F1F;font-size:14px;">( <strong style="color:#1A1A1A;">SUNO</strong> )</span>' +
    '</div>' +
    '<h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Olá' +
    (nome ? ', ' + escapeHtml(nome) : '') +
    '!</h1>' +
    '<p style="color:#444;font-size:14px;line-height:1.6;">Obrigado por responder o nosso teste de perfil de investidor. O resultado foi:</p>' +
    '<div style="background:#1A1A1A;color:#fff;padding:16px 20px;border-left:4px solid #C41F1F;margin:16px 0;">' +
    '<p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C41F1F;">Seu perfil</p>' +
    '<p style="margin:4px 0 0;font-size:20px;font-weight:700;">' +
    escapeHtml(alocacao.nomeExibicao) +
    '</p>' +
    '<p style="margin:4px 0 0;font-size:13px;color:#ccc;">' +
    escapeHtml(alocacao.tagline) +
    '</p>' +
    '</div>' +
    '<h2 style="font-size:16px;color:#1A1A1A;margin:24px 0 8px;">Carteira padrão recomendada pela Suno</h2>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px;">' +
    linhasAlocacao +
    '</table>' +
    '<h2 style="font-size:16px;color:#1A1A1A;margin:24px 0 8px;">Suas respostas</h2>' +
    linhasRespostas +
    '<div style="margin-top:28px;">' +
    '<a href="https://wa.me/5511920447843" style="background:#C41F1F;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Falar com um assessor Suno</a>' +
    '</div>' +
    '<p style="margin-top:32px;font-size:11px;color:#888;">( SUNO ) · Conteúdo educacional, não constitui recomendação de investimento.</p>' +
    '</div>'
  );
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
