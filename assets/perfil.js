// ==========================================================================
// Perfil de Investidor — quiz + captura de leads
// ==========================================================================

// Google Form (conta institucional Suno) usado como backend dos leads.
// O usuário nunca vê esse formulário — os dados são enviados em segundo plano.
const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLScDDrXLL6JtRKHSOdXfxQU3HppN8oCi4cmjlX6ivCmBOIRpsQ/formResponse';
const GOOGLE_FORM_FIELDS = {
  name: 'entry.912708665',
  email: 'entry.116340326',
  phone: 'entry.1752510174',
  profile: 'entry.204745964',
  answersSummary: 'entry.2119210900',
};

const QUESTIONS = [
  {
    text: 'Qual é o seu principal objetivo ao investir?',
    options: [
      { label: 'Preservar meu patrimônio e ter uma reserva de emergência', value: 1 },
      { label: 'Equilibrar segurança e crescimento do patrimônio no médio prazo', value: 2 },
      { label: 'Fazer meu patrimônio crescer de forma consistente no longo prazo', value: 3 },
      { label: 'Buscar os maiores ganhos possíveis, mesmo com mais risco', value: 4 },
    ],
  },
  {
    text: 'Por quanto tempo pretende deixar esse dinheiro investido, sem precisar resgatar?',
    options: [
      { label: 'Menos de 1 ano', value: 1 },
      { label: 'De 1 a 3 anos', value: 2 },
      { label: 'De 3 a 5 anos', value: 3 },
      { label: 'Mais de 5 anos', value: 4 },
    ],
  },
  {
    text: 'Como você classificaria seu conhecimento sobre investimentos?',
    options: [
      { label: 'Iniciante, ainda estou aprendendo o básico', value: 1 },
      { label: 'Intermediário, já invisto em renda fixa e conheço fundos', value: 2 },
      { label: 'Avançado, já invisto em ações e fundos imobiliários', value: 3 },
      { label: 'Experiente, opero ativamente e conheço outros mercados', value: 4 },
    ],
  },
  {
    text: 'Se sua carteira caísse 20% em um mês por causa de uma crise, o que você faria?',
    options: [
      { label: 'Resgataria tudo imediatamente para não perder mais', value: 1 },
      { label: 'Ficaria desconfortável, mas esperaria a situação melhorar', value: 2 },
      { label: 'Manteria a posição, pois sei que isso faz parte do processo', value: 3 },
      { label: 'Aproveitaria para investir mais, comprando na queda', value: 4 },
    ],
  },
  {
    text: 'Qual percentual da sua renda mensal você pretende destinar a investimentos?',
    options: [
      { label: 'Até 10%', value: 1 },
      { label: 'De 10% a 25%', value: 2 },
      { label: 'De 25% a 50%', value: 3 },
      { label: 'Mais de 50%', value: 4 },
    ],
  },
  {
    text: 'Entre as opções abaixo, qual carteira combina mais com você?',
    options: [
      { label: '100% em renda fixa, com baixo risco e rentabilidade previsível', value: 1 },
      { label: 'Principalmente renda fixa, com uma pequena parte em renda variável', value: 2 },
      { label: 'Equilíbrio entre renda fixa e renda variável (ações, fundos imobiliários)', value: 3 },
      { label: 'Principalmente renda variável, buscando maior potencial de retorno', value: 4 },
    ],
  },
];

const PROFILES = {
  conservador: { name: 'Conservador' },
  dinamico: { name: 'Dinâmico' },
  sofisticado: { name: 'Sofisticado' },
};

// Contato comercial Suno (Breno Ravani) via WhatsApp.
const SUNO_WHATSAPP_NUMBER = '5511920447843';

function buildWhatsappHref(profileName) {
  const message = `Olá! Fiz o teste de perfil de investidor da Suno e meu perfil deu "${profileName}". Gostaria de falar com um assessor.`;
  return `https://wa.me/${SUNO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const state = {
  current: 0,
  answers: new Array(QUESTIONS.length).fill(null),
};

const screens = {
  intro: document.getElementById('screen-intro'),
  quiz: document.getElementById('screen-quiz'),
  lead: document.getElementById('screen-lead'),
  result: document.getElementById('screen-result'),
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove('is-active'));
  screens[name].classList.add('is-active');
}

function renderQuestion() {
  const index = state.current;
  const question = QUESTIONS[index];
  const container = document.getElementById('question-container');

  container.innerHTML = `
    <h2>${question.text}</h2>
    <div class="quiz-options" role="radiogroup">
      ${question.options
        .map(
          (opt, i) => `
        <label class="quiz-option${state.answers[index] === opt.value ? ' is-selected' : ''}">
          <input type="radio" name="question-${index}" value="${opt.value}" ${
            state.answers[index] === opt.value ? 'checked' : ''
          }>
          <span>${opt.label}</span>
        </label>`
        )
        .join('')}
    </div>
  `;

  container.querySelectorAll('.quiz-option').forEach((optionEl) => {
    optionEl.addEventListener('click', () => {
      container.querySelectorAll('.quiz-option').forEach((el) => el.classList.remove('is-selected'));
      optionEl.classList.add('is-selected');
      const input = optionEl.querySelector('input');
      input.checked = true;
      state.answers[index] = Number(input.value);
      document.getElementById('btn-next').disabled = false;
    });
  });

  document.getElementById('progress-label').textContent = `Pergunta ${index + 1} de ${QUESTIONS.length}`;
  document.getElementById('progress-bar').style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;
  document.getElementById('btn-next').disabled = state.answers[index] === null;
  document.getElementById('btn-next').textContent = index === QUESTIONS.length - 1 ? 'Ver resultado' : 'Próxima';
  document.getElementById('btn-back').classList.toggle('is-visible', index > 0);
}

function getProfileKey() {
  const total = state.answers.reduce((sum, value) => sum + (value || 0), 0);
  if (total <= 11) return 'conservador';
  if (total <= 18) return 'dinamico';
  return 'sofisticado';
}

function buildAnswersSummary() {
  return QUESTIONS.map((question, index) => {
    const chosenValue = state.answers[index];
    const chosenOption = question.options.find((opt) => opt.value === chosenValue);
    return `${index + 1}. ${question.text} → ${chosenOption ? chosenOption.label : '(sem resposta)'}`;
  }).join('\n');
}

function renderResult() {
  const profile = PROFILES[getProfileKey()];
  document.getElementById('result-cta-primary').href = buildWhatsappHref(profile.name);
}

async function submitLead(payload) {
  try {
    const stored = JSON.parse(localStorage.getItem('leads_perfil_investidor') || '[]');
    stored.push(payload);
    localStorage.setItem('leads_perfil_investidor', JSON.stringify(stored));
  } catch (err) {
    console.warn('Não foi possível salvar o lead no localStorage', err);
  }

  console.log('[Lead capturado - perfil investidor]', payload);

  try {
    const body = new URLSearchParams();
    body.append(GOOGLE_FORM_FIELDS.name, payload.name);
    body.append(GOOGLE_FORM_FIELDS.email, payload.email);
    body.append(GOOGLE_FORM_FIELDS.phone, payload.phone);
    body.append(GOOGLE_FORM_FIELDS.profile, payload.profile);
    body.append(GOOGLE_FORM_FIELDS.answersSummary, payload.answersSummary);

    // mode: 'no-cors' é obrigatório para o Google Forms aceitar o POST, mas
    // isso também significa que não dá pra ler a resposta nem confirmar
    // sucesso por aqui — a confirmação real é ver a linha chegar na planilha.
    await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (err) {
    console.error('Falha ao enviar o lead para o Google Forms', err);
  }
}

function resetQuiz() {
  state.current = 0;
  state.answers = new Array(QUESTIONS.length).fill(null);
  document.getElementById('lead-form').reset();
  showScreen('intro');
}

// Navegação
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('quiz');
  renderQuestion();
});

document.getElementById('btn-next').addEventListener('click', () => {
  if (state.answers[state.current] === null) return;
  if (state.current < QUESTIONS.length - 1) {
    state.current += 1;
    renderQuestion();
  } else {
    showScreen('lead');
  }
});

document.getElementById('btn-back').addEventListener('click', () => {
  if (state.current > 0) {
    state.current -= 1;
    renderQuestion();
  }
});

document.getElementById('btn-lead-back').addEventListener('click', () => {
  showScreen('quiz');
  renderQuestion();
});

document.getElementById('btn-restart').addEventListener('click', (e) => {
  e.preventDefault();
  resetQuiz();
});

document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('lead-error');
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const consent = form.consent.checked;

  if (!name || !email || !phone || !consent) {
    errorEl.textContent = 'Preencha todos os campos e aceite o contato para continuar.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  const submitBtn = document.getElementById('btn-lead-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  const profileKey = getProfileKey();
  await submitLead({
    name,
    email,
    phone,
    profile: PROFILES[profileKey].name,
    answers: state.answers,
    answersSummary: buildAnswersSummary(),
    date: new Date().toISOString(),
  });

  submitBtn.disabled = false;
  submitBtn.textContent = 'Ver meu resultado';

  renderResult();
  showScreen('result');
});

document.getElementById('year').textContent = new Date().getFullYear();
