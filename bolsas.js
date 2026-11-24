/* EcoLoop: bolsas fictícias + desconto por pontos.
   O saldo de pontos vem da calculadora de entrega (calculadora.js).
   TUDO AQUI É EXEMPLO. Edite BOLSAS quando os dados reais existirem. */

const REGRAS = (typeof PONTOS_CFG !== 'undefined') ? PONTOS_CFG : { ptsPorReal: 10, descontoMax: 0.40, bonus: { minTipos: 3, percentual: 0.10 } };

const BOLSAS = [
  { id: 'tote-jeans',   nome: 'Tote Jeans',      material: 'Feita de calças jeans',   preco: 89.90,  cor: '#476b4f', alca: '#1c3b2f' },
  { id: 'ecobag-camis', nome: 'Ecobag Camiseta', material: 'Feita de camisetas',      preco: 49.90,  cor: '#e3d5b8', alca: '#476b4f' },
  { id: 'lona-urbana',  nome: 'Urbana de Lona',  material: 'Feita de lona de banner', preco: 119.90, cor: '#1c3b2f', alca: '#476b4f' },
  { id: 'necessaire',   nome: 'Necessaire PET',  material: 'Feita de garrafas PET',   preco: 39.90,  cor: '#bfd0b6', alca: '#476b4f' }
];

(function () {
  const $ = id => document.getElementById(id);
  const grid = $('bolsas-grid');
  const saldoNum = $('pts-saldo'), saldoInfo = $('pts-saldo-info');
  const usarIn = $('pts-usar-input'), usarRange = $('pts-usar-range');
  const usarTxt = $('pts-usar-txt'), usarDesc = $('pts-usar-desc'), nota = $('pts-nota');
  if (!grid || !usarIn || !usarRange) return;

  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const clamp = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  let saldo = 0, usar = 0;

  /* Tabela de pontos por material (vem de calculadora.js) */
  const tabela = $('tabela-pontos');
  if (tabela && typeof MATERIAIS !== 'undefined') {
    tabela.innerHTML = MATERIAIS.map(m =>
      `<li><strong>${m.nome}</strong><span>${m.pts} pontos por ${m.unidade}</span></li>`).join('') +
      `<li><strong>Bônus de variedade</strong><span>+${Math.round(REGRAS.bonus.percentual * 100)}% ao levar ${REGRAS.bonus.minTipos} tipos de material</span></li>`;
  }

  const svg = b => `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M38 48V36a10 10 0 0 1 20 0v12M62 48V36a10 10 0 0 1 20 0v12" fill="none" stroke="${b.alca}" stroke-width="6" stroke-linecap="round"/>
      <path d="M22 46h76l6 54a8 8 0 0 1-8 9H24a8 8 0 0 1-8-9z" fill="${b.cor}"/>
      <path d="M60 70c-7 0-11 4-11 10 7 0 11-4 11-10z" fill="${b.alca}" opacity=".7"/>
    </svg>`;

  grid.innerHTML = BOLSAS.map(b => `
    <article class="b-card" data-id="${b.id}">
      <div class="b-art">${svg(b)}</div>
      <div class="b-info">
        <h3>${b.nome}</h3>
        <p class="b-mat">${b.material}</p>
        <div class="b-preco"><span class="final"></span><span class="antigo"></span></div>
        <p class="b-desc"></p>
        <div class="b-barra"><i></i></div>
        <p class="b-meta"></p>
        <button type="button">Quero esta bolsa</button>
      </div>
    </article>`).join('');

  function calc(b, pts) {
    const maxDesc = b.preco * REGRAS.descontoMax;
    const ptsParaMax = Math.ceil(maxDesc * REGRAS.ptsPorReal);
    const usados = Math.min(pts, ptsParaMax);
    const desconto = Math.min(maxDesc, usados / REGRAS.ptsPorReal);
    return { desconto, usados, ptsParaMax };
  }

  function render() {
    saldoNum.textContent = saldo.toLocaleString('pt-BR');
    saldoInfo.textContent = saldo > 0
      ? `Sua entrega vale até ${brl(saldo / REGRAS.ptsPorReal)} de desconto. Ajuste abaixo quantos pontos quer usar.`
      : 'Monte sua entrega na calculadora para ver quantos pontos ela rende.';
    usarRange.max = saldo;
    usarRange.value = usar;
    usarRange.disabled = saldo === 0;
    usarIn.max = saldo;
    usarIn.value = usar;
    usarIn.disabled = saldo === 0;
    usarTxt.textContent = `${usar} pontos`;
    usarDesc.textContent = usar > 0
      ? `até ${brl(usar / REGRAS.ptsPorReal)} de desconto em uma bolsa`
      : (saldo > 0 ? 'escolha quantos pontos usar' : 'sem pontos ainda');
    if (nota) nota.textContent = `Regra de exemplo: ${REGRAS.ptsPorReal} pontos = R$ 1,00, com desconto máximo de ${Math.round(REGRAS.descontoMax * 100)}% do preço de cada bolsa.`;

    BOLSAS.forEach(b => {
      const el = grid.querySelector(`[data-id="${b.id}"]`);
      const c = calc(b, usar);
      el.querySelector('.final').textContent = brl(b.preco - c.desconto);
      el.querySelector('.antigo').textContent = c.desconto > 0 ? brl(b.preco) : '';
      el.querySelector('.b-desc').textContent = c.desconto > 0
        ? `Desconto de ${brl(c.desconto)} usando ${c.usados} pontos`
        : 'Entregue materiais e ganhe pontos de desconto';
      el.querySelector('.b-barra i').style.width = Math.min(100, (usar / c.ptsParaMax) * 100) + '%';
      let meta;
      if (usar >= c.ptsParaMax) meta = `Desconto máximo atingido. Sobram ${saldo - c.usados} pontos no seu saldo.`;
      else if (saldo >= c.ptsParaMax) meta = `Use ${c.ptsParaMax} pontos para o desconto máximo.`;
      else meta = `Faltam ${c.ptsParaMax - saldo} pontos de entrega para o desconto máximo.`;
      el.querySelector('.b-meta').textContent = meta;
    });
  }

  function setSaldo(novo) {
    const seguia = usar === saldo;
    saldo = Math.max(0, Math.round(Number(novo) || 0));
    usar = seguia ? saldo : Math.min(usar, saldo);
    render();
  }
  function setUsar(v) { usar = clamp(v, saldo); render(); }

  document.addEventListener('ecoloop:pontos', e => setSaldo(e.detail && e.detail.total));
  usarIn.addEventListener('input', () => setUsar(usarIn.value));
  usarRange.addEventListener('input', () => setUsar(usarRange.value));
  document.querySelectorAll('[data-usar-tudo]').forEach(btn => btn.addEventListener('click', () => setUsar(saldo)));
  document.querySelectorAll('[data-usar-nada]').forEach(btn => btn.addEventListener('click', () => setUsar(0)));

  grid.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const b = BOLSAS.find(x => x.id === btn.closest('.b-card').dataset.id);
    const c = calc(b, usar);
    const msg = `Olá! Quero a bolsa "${b.nome}" (${brl(b.preco)}). ` +
      (c.usados > 0
        ? `Minha entrega rendeu ${saldo} pontos e quero usar ${c.usados} para ${brl(c.desconto)} de desconto (total ${brl(b.preco - c.desconto)}).`
        : 'Ainda não tenho pontos para usar nesta compra.');
    const zap = (window.CONTATO && window.CONTATO.whatsapp) || '';
    window.open(`https://wa.me/${zap}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  setSaldo((window.EcoLoopPontos && window.EcoLoopPontos.total) || 0);
})();