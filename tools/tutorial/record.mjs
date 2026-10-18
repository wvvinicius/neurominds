/**
 * Grava o tutorial da NeuroMinds com Playwright.
 *
 *   node record.mjs                       → usa http://localhost:3000 (admin "neurominds", login do pro sem e-mail)
 *   BASE=https://neurominds.vercel.app ADMIN_PASSWORD=... node record.mjs
 *
 * Saída: out/tutorial-neurominds.mp4 (1280x720). Sem áudio: as legendas na tela explicam cada passo.
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const BASE = process.env.BASE ?? "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "neurominds";
const OUT = path.resolve(import.meta.dirname, "out");
const RAW = path.join(OUT, "raw");
rmSync(RAW, { recursive: true, force: true });
mkdirSync(RAW, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: RAW, size: { width: 1280, height: 720 } },
  locale: "pt-BR",
  reducedMotion: "no-preference",
});
const page = await context.newPage();

/* ---------- cursor visível e legendas, injetados em toda página ---------- */
await context.addInitScript(() => {
  const css = `
    #tut-cursor{position:fixed;z-index:2147483647;width:26px;height:26px;pointer-events:none;transform:translate(-4px,-2px);
      filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));transition:transform .08s}
    #tut-cursor.down{transform:translate(-4px,-2px) scale(.85)}
    #tut-ring{position:fixed;z-index:2147483646;width:44px;height:44px;border:4px solid #1b7fbd;border-radius:50%;
      pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.4)}
    #tut-ring.go{animation:tut-ring .5s ease-out}
    @keyframes tut-ring{0%{opacity:.9;transform:translate(-50%,-50%) scale(.4)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}
    #tut-cap{position:fixed;z-index:2147483645;left:50%;bottom:28px;transform:translateX(-50%);max-width:82%;
      background:rgba(26,26,26,.88);color:#fff;font:800 22px/1.3 Nunito,system-ui,sans-serif;padding:14px 22px;border-radius:999px;
      box-shadow:0 6px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .25s;pointer-events:none;text-align:center}
    #tut-cap.on{opacity:1}
    #tut-title{position:fixed;z-index:2147483645;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;
      background:#fff;color:#1a1a1a;font-family:Nunito,system-ui,sans-serif;text-align:center;padding:40px}
    #tut-title h1{font-size:54px;margin:0;letter-spacing:.04em}
    #tut-title p{font-size:24px;margin:0;color:#555;font-weight:800}
    #tut-title.on{display:flex}
    nextjs-portal{display:none!important}`;
  const ready = () => {
    if (document.getElementById("tut-cursor")) return;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    const cur = document.createElement("div");
    cur.id = "tut-cursor";
    cur.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 3l14 8-6 1.5L16 20l-3 1.3-3-7.5L5 17z" fill="#fff" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    const ring = document.createElement("div");
    ring.id = "tut-ring";
    const cap = document.createElement("div");
    cap.id = "tut-cap";
    const title = document.createElement("div");
    title.id = "tut-title";
    document.body.append(cur, ring, cap, title);
    document.addEventListener("mousemove", (e) => {
      cur.style.left = e.clientX + "px";
      cur.style.top = e.clientY + "px";
    }, true);
    document.addEventListener("mousedown", (e) => {
      cur.classList.add("down");
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      ring.classList.remove("go");
      void ring.offsetWidth;
      ring.classList.add("go");
    }, true);
    document.addEventListener("mouseup", () => cur.classList.remove("down"), true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
  window.__tut = {
    cap(text) {
      const el = document.getElementById("tut-cap");
      if (!el) return;
      if (!text) return el.classList.remove("on");
      el.textContent = text;
      el.classList.add("on");
    },
    title(h, p) {
      const el = document.getElementById("tut-title");
      if (!el) return;
      if (!h) return el.classList.remove("on");
      el.innerHTML = `<h1>${h}</h1><p>${p ?? ""}</p>`;
      el.classList.add("on");
    },
  };
});

/** Token de login gravado direto no banco local (só para a gravação, sem e-mail). */
async function loginToken(email, name) {
  const { createClient } = await import("../../app/node_modules/@libsql/client/lib-esm/node.js");
  const { createHash, randomBytes } = await import("node:crypto");
  const db = createClient({ url: `file:${path.resolve(import.meta.dirname, "../../app/data/neurominds.db")}` });
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 20 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19);
  await db.execute({
    sql: "INSERT INTO login_token (token_hash, email, name, expires_at) VALUES (?, ?, ?, ?)",
    args: [createHash("sha256").update(token).digest("hex"), email, name, expires],
  });
  return token;
}

const sleep = (ms) => page.waitForTimeout(ms);
const cap = async (text, ms = 2600) => {
  await page.evaluate((t) => window.__tut?.cap(t), text);
  await sleep(ms);
};
const title = async (h, p, ms = 2400) => {
  await page.evaluate(([a, b]) => window.__tut?.title(a, b), [h, p]);
  await sleep(ms);
  await page.evaluate(() => window.__tut?.title(null));
};
/** Move o cursor até o elemento devagar e clica. */
async function click(locator, { settle = 900 } = {}) {
  const el = locator.first();
  await el.waitFor({ state: "visible" });
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: 24 });
  await sleep(350);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
  await sleep(settle);
}
async function type(locator, text) {
  await click(locator, { settle: 200 });
  await locator.first().pressSequentially(text, { delay: 45 });
  await sleep(400);
}
async function skipIntro() {
  const pular = page.getByRole("button", { name: "Pular" });
  if (await pular.isVisible().catch(() => false)) await click(pular);
}

/* ======================= ROTEIRO ======================= */

// 1. Entrada
await page.goto(BASE);
await page.mouse.move(640, 360);
await title("NeuroMinds", "Tutorial: cartas, painel de verbos e área do profissional");
await cap("Ao abrir o site, o Teo se apresenta. Dá para pular, repetir ou seguir.", 3200);
await skipIntro();
await cap("Depois do vídeo, você escolhe quem é: profissional ou aluno.", 2800);
await cap("Para explorar sem login, use \"Só quero ver as cartas\".", 2200);
await click(page.getByRole("link", { name: "Só quero ver as cartas" }));

// 2. Cartas e galeria
await cap("Cada carta é uma ação. O número no canto diz quantos vídeos ela tem.", 3200);
await page.mouse.move(300, 420, { steps: 20 });
await sleep(600);
await click(page.getByRole("link", { name: /Chutar/ }));
await cap("O vídeo começa sozinho. Use as setas para ver outros contextos da mesma ação.", 3600);
await click(page.getByRole("button", { name: "Próximo vídeo" }));
await cap("Chutar no karatê. A criança decide quando avançar: nada passa sozinho.", 3200);
await click(page.getByRole("button", { name: "Próximo vídeo" }));
await cap("As fichas numeradas pulam direto para um vídeo. O botão amarelo repete.", 3000);
await click(page.getByRole("button", { name: "Repetir este vídeo" }));
await sleep(1500);
await cap("O botão de som liga e desliga tudo, e fica lembrado no aparelho.", 2600);
await click(page.getByRole("link", { name: "Voltar para as cartas" }));
await sleep(600);
await click(page.getByRole("link", { name: "Voltar para as cartas" }));
await skipIntro();

// 3. Área do profissional
await title("Área do profissional", "Cadastrar a criança, montar o painel de verbos e acompanhar");
await click(page.getByRole("link", { name: "Sou profissional" }));
await cap("Sem senha: você informa o e-mail e recebe um link de acesso.", 2600);
await type(page.locator("#email"), "fono@exemplo.com");
await page.mouse.move(640, 600, { steps: 10 });
await cap("Ao pedir o acesso, o link chega no e-mail e vale por 20 minutos. Vamos abri-lo.", 3000);
// Na gravação, o link é gerado direto no banco local, sem disparar e-mail.
await page.goto(`${BASE}/pro/entrar?token=${await loginToken("fono@exemplo.com", "Fono Ana")}`);
await page.waitForURL((u) => u.pathname === "/pro");
await page.locator("#nickname").waitFor({ state: "visible" });
await cap("Aqui ficam os alunos. Vamos cadastrar uma criança.", 2400);
const nick = `Lua ${Math.floor(Math.random() * 90 + 10)}`;
await type(page.locator("#nickname"), nick);
await cap("Use um apelido, nunca o nome real. O e-mail do responsável é opcional.", 2800);
await click(page.getByRole("button", { name: "Cadastrar" }));
await page.waitForURL(/\/pro\/alunos\//);
const studentUrl = page.url();
await cap("Cada criança tem um link secreto. É assim que ela abre o painel de verbos, sem login.", 3200);
await cap("Agora o painel de verbos: marque só as ações que fazem sentido para essa criança.", 2800);
for (const name of [/Chutar/, /Esperar/, /Escovar/]) {
  await click(page.locator("label").filter({ hasText: name }).first(), { settle: 500 });
}
await click(page.getByRole("button", { name: "Salvar painel" }));
await cap("Painel salvo. Copie o link para o responsável, ou abra aqui no consultório.", 3000);
await click(page.getByRole("link", { name: "Abrir agora no consultório" }));

// 4. Prancha da criança
await page.waitForURL(/\/p\//);
await cap("A criança vê só as cartas escolhidas, com o nome dela na tela.", 3000);
await click(page.getByRole("link", { name: /Esperar/ }));
await cap("Tudo que ela faz aqui vira registro da sessão: tempo, ações abertas, vídeos vistos.", 3400);
await click(page.getByRole("button", { name: "Próximo vídeo" }));
await sleep(2500);
await click(page.getByRole("link", { name: "Voltar para as cartas" }));
await sleep(1200);
// Carregamento completo: o histórico do navegador traria a página em cache, sem a sessão nova.
await page.goto(studentUrl);
await page.waitForURL(/\/pro\/alunos\//);
await sleep(800);

// 5. Relatório
await page.evaluate(() => document.querySelector("h2")?.scrollIntoView());
const rel = page.getByRole("heading", { name: "Relatório" });
await rel.scrollIntoViewIfNeeded();
await sleep(600);
await cap("De volta ao aluno, a sessão já aparece no relatório, marcada como consultório.", 3200);
const note = page.locator("textarea[name=note]").first();
if (await note.isVisible().catch(() => false)) {
  await type(note, "Entendeu \"esperar\" na fila. Pediu para repetir o vídeo do carro.");
  await click(page.getByRole("button", { name: "Salvar observação" }).first());
  await cap("Sessões presenciais aceitam uma observação do atendimento.", 2600);
}
await cap("Por ação, você vê o que ela mais abriu e o que assistiu até o fim.", 2800);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await sleep(900);
await cap("\"Exportar CSV\" baixa os dados agregados e anônimos para pesquisa.", 2600);

// 6. Admin
await title("Gerenciador de conteúdo", "Onde a equipe cadastra ações e vídeos");
await page.goto(`${BASE}/admin/login`);
await cap("A equipe de conteúdo entra com a senha única.", 2000);
await type(page.locator("#password"), ADMIN_PASSWORD);
await click(page.getByRole("button", { name: "Entrar" }));
await page.waitForURL(/\/admin$/);
await cap("Aqui ficam todas as ações: ordem, ativa ou inativa, e edição.", 3000);
await click(page.getByRole("link", { name: "Vídeos e edição" }).first());
await cap("Dentro da ação: os vídeos com pré-visualização, legenda e ordem.", 3000);
await page.evaluate(() => document.querySelector("h3")?.scrollIntoView({ behavior: "smooth", block: "center" }));
await sleep(900);
await cap("Vídeo novo: envie o arquivo ou cole um link. Aparece no site na hora.", 3000);
await page.goto(`${BASE}/admin/uso`);
await cap("Em \"Uso\", contagens anônimas: sessões, ações mais abertas e vídeos até o fim.", 3200);

await page.goto(`${BASE}/cartas`);
await title("NeuroMinds", "neurominds.vercel.app · feito com amor pela Sunter", 3000);

await context.close();
await browser.close();

/* ---------- converte webm → mp4 ---------- */
const webm = readdirSync(RAW).filter((f) => f.endsWith(".webm")).map((f) => path.join(RAW, f)).sort((a, b) => statSync(b).size - statSync(a).size)[0];
const mp4 = path.join(OUT, "tutorial-neurominds.mp4");
// O download do ffmpeg-static às vezes vem truncado; nesse caso usa o binário do gerador do Teo.
const ffmpegBin =
  existsSync(ffmpeg) && statSync(ffmpeg).size > 1_000_000
    ? ffmpeg
    : path.resolve(import.meta.dirname, "../../insumos/teo-personagem/node_modules/ffmpeg-static/ffmpeg.exe");
execFileSync(ffmpegBin, ["-y", "-loglevel", "error", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", "-movflags", "+faststart", mp4]);
renameSync(webm, path.join(OUT, "tutorial-neurominds.webm"));
console.log("ok", mp4, (statSync(mp4).size / 1024 / 1024).toFixed(1), "MB");
