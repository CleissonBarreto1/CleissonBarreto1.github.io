// Menu mobile
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// FAQ accordion
document.querySelectorAll('.accordion__item').forEach((item) => {
  const trigger = item.querySelector('.accordion__trigger');
  const panel = item.querySelector('.accordion__panel');

  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    document.querySelectorAll('.accordion__item').forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.accordion__panel').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('is-open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Cotações em tempo real (Ibovespa, Dólar, Selic)
const BRAPI_TOKEN = 'tpwk5stoBpxj1nfZxbaDLr';

function formatPercent(value) {
  const arrow = value >= 0 ? '▲' : '▼';
  return `${arrow} ${Math.abs(value).toFixed(2).replace('.', ',')}%`;
}

function setQuote(el, text, changeValue) {
  el.textContent = text;
  el.classList.remove('up', 'down');
  if (typeof changeValue === 'number') {
    el.classList.add(changeValue >= 0 ? 'up' : 'down');
  }
}

async function updateQuotes() {
  const ibovEl = document.getElementById('quote-ibov');
  const usdEl = document.getElementById('quote-usd');
  const selicEl = document.getElementById('quote-selic');
  const noteEl = document.getElementById('quote-note');

  const [ibov, usd, selic] = await Promise.allSettled([
    fetch(`https://brapi.dev/api/quote/%5EBVSP?token=${BRAPI_TOKEN}`).then((r) => r.json()),
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL').then((r) => r.json()),
    fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json').then((r) => r.json()),
  ]);

  if (ibov.status === 'fulfilled') {
    const change = ibov.value.results[0].regularMarketChangePercent;
    setQuote(ibovEl, formatPercent(change), change);
  } else {
    ibovEl.textContent = 'indisponível';
  }

  if (usd.status === 'fulfilled') {
    const change = parseFloat(usd.value.USDBRL.pctChange);
    setQuote(usdEl, formatPercent(change), change);
  } else {
    usdEl.textContent = 'indisponível';
  }

  if (selic.status === 'fulfilled') {
    const value = parseFloat(selic.value[0].valor);
    selicEl.textContent = `${value.toFixed(2).replace('.', ',')}%`;
  } else {
    selicEl.textContent = 'indisponível';
  }

  const now = new Date();
  noteEl.textContent = `Atualizado às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

updateQuotes();
setInterval(updateQuotes, 5 * 60 * 1000);
