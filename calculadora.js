/* EcoLoop: sistema de pontos + quiz "Posso entregar isso?" + calculadora de entrega.
   TUDO AQUI É EXEMPLO. Pesos, pontos e regras serão substituídos pelos oficiais do projeto.

   Como funciona: cada material tem um valor em pontos por unidade (MATERIAIS).
   A calculadora soma a entrega, aplica o bônus e publica o total em
   window.EcoLoopPontos. O painel de bolsas (bolsas.js) usa esse total como saldo. */

const PONTOS_CFG = {
  ptsPorReal: 10,      // 10 pontos = R$ 1,00 de desconto
  descontoMax: 0.40,   // desconto máximo de 40% do preço da bolsa
  bonus: { minTipos: 3, percentual: 0.10 } // +10% ao entregar 3 ou mais tipos de material
};

const MATERIAIS = [
  { id: 'camiseta', nome: 'Camisetas',      unidade: 'peça',    plural: 'peças',    kg: 0.20, kgBolsa: 1.00, pts: 20, max: 30 },
  { id: 'jeans',    nome: 'Calças jeans',   unidade: 'peça',    plural: 'peças',    kg: 0.60, kgBolsa: 1.20, pts: 60, max: 20 },
  { id: 'lona',     nome: 'Lona de banner', unidade: 'm²',      plural: 'm²',       kg: 0.45, kgBolsa: 1.50, pts: 50, max: 20 },
  { id: 'pet',      nome: 'Garrafas PET',   unidade: 'garrafa', plural: 'garrafas', kg: 0.03, kgBolsa: 0.45, pts: 3,  max: 100 }
];

const ITENS = [
  { nome: 'Camiseta limpa',            res: 'sim',     mat: 'camiseta', txt: 'Camisetas limpas e inteiras viram bolsas.' },
  { nome: 'Camiseta rasgada',          res: 'parcial', txt: 'Vai para reciclagem, mas não vira bolsa e não gera pontos.' },
  { nome: 'Calça jeans',               res: 'sim',     mat: 'jeans',    txt: 'Jeans limpo é um dos materiais mais valiosos para as bolsas.' },
  { nome: 'Jeans molhado ou com mofo', res: 'nao',     txt: 'Material úmido ou com mofo não pode ser aproveitado.' },
  { nome: 'Lona de banner',            res: 'sim',     mat: 'lona',     txt: 'Lona limpa e sem cola vira bolsa resistente e impermeável.' },
  { nome: 'Garrafa PET limpa',         res: 'sim',     mat: 'pet',      txt: 'Entregue limpa e seca. Garrafas PET têm destinação responsável.' },
  { nome: 'Garrafa com óleo ou químico', res: 'nao',   txt: 'Embalagens com resíduos perigosos precisam de descarte especializado.' },
  { nome: 'Roupa íntima ou meias',     res: 'nao',     txt: 'Por higiene, esses itens não são aceitos.' },
  { nome: 'Pilhas e eletrônicos',      res: 'nao',     txt: 'Leve a um ponto de descarte de eletrônicos e pilhas.' }
];

(function () {
  const $ = id => document.getElementById(id);
  const rows = $('calc-rows');
  if (!rows) return;
  const cfg = PONTOS_CFG;
  const fmt = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const ptsTxt = m => `${m.pts} pontos por ${m.unidade}`;
  const qtd = {};
  MATERIAIS.forEach(m => { qtd[m.id] = 0; });

  /* ---------- Quiz ---------- */
  const chips = $('quiz-chips'), verdict = $('quiz-verdict');
  const ICONES = { sim: '✓', parcial: '!', nao: '✕' };
  const TITULOS = { sim: 'Pode entregar!', parcial: 'Entrega parcial', nao: 'Não aceitamos' };
  if (chips && verdict) {
    chips.innerHTML = ITENS.map((it, i) => `<button type="button" class="cx-chip" data-i="${i}">${it.nome}</button>`).join('');
    chips.addEventListener('click', e => {
      const b = e.target.closest('.cx-chip');
      if (!b) return;
      chips.querySelectorAll('.cx-chip').forEach(c => c.classList.toggle('on', c === b));
      const it = ITENS[+b.dataset.i];
      const m = it.mat && MATERIAIS.find(x => x.id === it.mat);
      const extra = m ? ` Vale ${ptsTxt(m)}.` : '';
      verdict.dataset.estado = it.res;
      verdict.innerHTML = `<div class="ico">${ICONES[it.res]}</div><div><strong>${TITULOS[it.res]}</strong><span>${it.txt}${extra}</span></div>`;
    });
  }

  /* ---------- Calculadora ---------- */
  rows.innerHTML = MATERIAIS.map(m => `
    <div class="cx-row" data-id="${m.id}">
      <div class="cx-info"><strong>${m.nome}</strong><span>${ptsTxt(m)}</span></div>
      <div class="cx-step">
        <button type="button" data-act="menos" aria-label="Diminuir ${m.nome}">−</button>
        <input type="number" min="0" max="${m.max}" value="0" inputmode="numeric" aria-label="Quantidade de ${m.nome} em ${m.plural}">
        <button type="button" data-act="mais" aria-label="Aumentar ${m.nome}">+</button>
      </div>
      <div class="cx-sub">0 pts</div>
    </div>`).join('');

  function totais() {
    let kg = 0, bolsas = 0, base = 0, tipos = 0;
    MATERIAIS.forEach(m => {
      const q = qtd[m.id];
      if (q > 0) tipos++;
      kg += q * m.kg;
      bolsas += (q * m.kg) / m.kgBolsa;
      base += q * m.pts;
    });
    const bonus = tipos >= cfg.bonus.minTipos ? Math.round(base * cfg.bonus.percentual) : 0;
    return { kg, bolsas, base, bonus, total: base + bonus, tipos };
  }

  function render() {
    const t = totais();
    MATERIAIS.forEach(m => {
      const row = rows.querySelector(`[data-id="${m.id}"]`);
      row.querySelector('input').value = qtd[m.id];
      row.querySelector('.cx-sub').textContent = `${qtd[m.id] * m.pts} pts`;
    });
    $('calc-kg').textContent = fmt(t.kg, 1);
    $('calc-bolsas').textContent = Math.floor(t.bolsas);
    $('calc-pts').textContent = fmt(t.total);
    const frac = t.bolsas - Math.floor(t.bolsas);
    $('calc-bar').style.width = Math.round(frac * 100) + '%';
    const n = Math.floor(t.bolsas);
    $('calc-bar-txt').textContent = `${n} ${n === 1 ? 'bolsa completa' : 'bolsas completas'}`;
    $('calc-bar-pct').textContent = `${Math.round(frac * 100)}% da próxima`;

    const msg = $('calc-msg');
    if (t.total === 0) {
      msg.textContent = 'Escolha os materiais que você vai levar ao ponto de coleta.';
    } else {
      const desc = t.total / cfg.ptsPorReal;
      const bonusTxt = t.bonus > 0
        ? ` Inclui bônus de ${Math.round(cfg.bonus.percentual * 100)}% (+${t.bonus} pontos) por levar ${t.tipos} tipos de material.`
        : (t.tipos < cfg.bonus.minTipos ? ` Leve ${cfg.bonus.minTipos} tipos de material e ganhe ${Math.round(cfg.bonus.percentual * 100)}% a mais.` : '');
      msg.textContent = `Sua entrega rende ${fmt(t.total)} pontos, o equivalente a até ${brl(desc)} de desconto.${bonusTxt}`;
    }

    const wa = $('calc-wa');
    if (wa) {
      const lista = MATERIAIS.filter(m => qtd[m.id] > 0).map(m => `${qtd[m.id]} ${m.plural} de ${m.nome.toLowerCase()}`).join(', ');
      const zap = (typeof CONTATO !== 'undefined' && CONTATO.whatsapp) || '';
      const texto = `Olá! Quero entregar: ${lista}. Pela calculadora, isso rende ${fmt(t.total)} pontos.`;
      wa.href = t.total > 0 ? `https://wa.me/${zap}?text=${encodeURIComponent(texto)}` : '#';
      wa.classList.toggle('disabled', t.total === 0);
      wa.setAttribute('aria-disabled', String(t.total === 0));
    }

    window.EcoLoopPontos = { total: t.total, base: t.base, bonus: t.bonus, tipos: t.tipos };
    document.dispatchEvent(new CustomEvent('ecoloop:pontos', { detail: window.EcoLoopPontos }));
  }

  function setQtd(id, v) {
    const m = MATERIAIS.find(x => x.id === id);
    qtd[id] = Math.max(0, Math.min(m.max, Math.round(Number(v) || 0)));
    render();
  }

  rows.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const id = b.closest('.cx-row').dataset.id;
    setQtd(id, qtd[id] + (b.dataset.act === 'mais' ? 1 : -1));
  });
  rows.addEventListener('input', e => {
    if (e.target.matches('input')) setQtd(e.target.closest('.cx-row').dataset.id, e.target.value);
  });

  const wa = $('calc-wa');
  if (wa) wa.addEventListener('click', e => { if (wa.classList.contains('disabled')) e.preventDefault(); });
  const reset = $('calc-reset');
  if (reset) reset.addEventListener('click', () => { MATERIAIS.forEach(m => { qtd[m.id] = 0; }); render(); });

  render();
})();