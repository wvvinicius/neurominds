/**
 * Importa ou atualiza os vídeos de ação do Teo no app.
 *
 *   node scripts/import-teo.mjs --target local                      # primeira importação (banco em data/)
 *   node scripts/import-teo.mjs --target turso                      # produção
 *   node scripts/import-teo.mjs --target turso --source ../insumos/novos-acao-uma-vez --release v2
 *       → sobe os arquivos da pasta para acoes/v2/<ID>.mp4, aponta o banco para eles e apaga os antigos do Blob
 *
 * Cada "<ID>-<slug>-som.mp4" vira um vídeo. URLs ficam em scripts/teo-blob-urls.json.
 * Cria ações que faltam (emoji, cor em rodízio), cadastra vídeos com legenda curta,
 * desativa ações sem vídeo. Idempotente.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import { createClient } from "@libsql/client";

const ROOT = path.resolve(import.meta.dirname, "..");
const URLS_FILE = path.resolve(ROOT, "scripts/teo-blob-urls.json");

const arg = (name, fallback) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback);
const target = arg("--target", "local");
const SOURCE = path.resolve(ROOT, arg("--source", "../insumos/teo-personagem/video/acoes"));
const RELEASE = arg("--release", ""); // "" = acoes/<ID>.mp4 ; "v2" = acoes/v2/<ID>.mp4

/* ---------- plano: ação → emoji; vídeo → legenda ---------- */
const ACTIONS = {
  esperar: ["Esperar", "⏳"], abaixar: ["Abaixar", "🙇"], levantar: ["Levantar", "🧍"], limpar: ["Limpar", "🧽"],
  vestir: ["Vestir", "👕"], escovar: ["Escovar", "🪥"], pentear: ["Pentear", "💇"], calcar: ["Calçar", "👟"],
  tirar: ["Tirar", "🦶"], abrir: ["Abrir", "🚪"], nadar: ["Nadar", "🏊"], empurrar: ["Empurrar", "🛒"],
  comprar: ["Comprar", "🧺"], pagar: ["Pagar", "💵"], pintar: ["Pintar", "🎨"], correr: ["Correr", "🏃"],
  chorar: ["Chorar", "😢"], carregar: ["Carregar", "📦"], subir: ["Subir", "⬆️"], descer: ["Descer", "⬇️"],
  passear: ["Passear", "🐕"], cortar: ["Cortar", "✂️"], cantar: ["Cantar", "🎤"], dancar: ["Dançar", "💃"],
  jogar: ["Jogar", "🎲"], pegar: ["Pegar", "🧸"], guardar: ["Guardar", "🧰"], encaixar: ["Encaixar", "🧩"],
  comer: ["Comer", "🍎"], beber: ["Beber", "🥤"],
};

const VIDEOS_PLAN = [
  ["V01-esperar-carro", "esperar", "Esperar o carro"], ["V02-esperar-almoco", "esperar", "Esperar o almoço"],
  ["V03-esperar-vez-escorregador", "esperar", "Esperar a vez no escorregador"],
  ["V04-abaixar-corpo", "abaixar", "Abaixar o corpo"], ["V05-abaixar-tampa-vaso", "abaixar", "Abaixar a tampa do vaso"],
  ["V06-levantar-corpo", "levantar", "Levantar o corpo"], ["V07-levantar-tampa-vaso", "levantar", "Levantar a tampa do vaso"],
  ["V08-limpar-maos-toalha", "limpar", "Limpar as mãos"], ["V09-limpar-oculos", "limpar", "Limpar os óculos"], ["V10-limpar-chao", "limpar", "Limpar o chão"],
  ["V11-vestir-camiseta", "vestir", "Vestir a camiseta"],
  ["V12-escovar-dentes", "escovar", "Escovar os dentes"], ["V13-escovar-cachorro", "escovar", "Escovar o cachorro"],
  ["V14-pentear-cabelo", "pentear", "Pentear o cabelo"],
  ["V15-calcar-sapato", "calcar", "Calçar o sapato"], ["V16-tirar-sapato", "tirar", "Tirar o sapato"],
  ["V17-abrir-porta", "abrir", "Abrir a porta"], ["V18-abrir-janela", "abrir", "Abrir a janela"], ["V19-abrir-caixa", "abrir", "Abrir a caixa"],
  ["V20-nadar-piscina", "nadar", "Nadar na piscina"], ["V21-nadar-mar", "nadar", "Nadar no mar"],
  ["V22-empurrar-carrinho", "empurrar", "Empurrar o carrinho"],
  ["V23-comprar-fruta", "comprar", "Comprar fruta"], ["V24-pagar", "pagar", "Pagar no caixa"],
  ["V25-pintar-lapis-de-cor", "pintar", "Pintar com lápis de cor"], ["V26-pintar-tinta-pincel", "pintar", "Pintar com tinta"], ["V27-pintar-parede-rolo", "pintar", "Pintar a parede"],
  ["V28-correr-parque", "correr", "Correr no parque"],
  ["V29-chorar-de-dor", "chorar", "Chorar de dor"], ["V30-chorar-de-saudade", "chorar", "Chorar de saudade"],
  ["V31-carregar-caixa", "carregar", "Carregar a caixa"], ["V32-carregar-irmaozinho", "carregar", "Carregar o irmãozinho"],
  ["V33-subir-escada", "subir", "Subir a escada"], ["V34-descer-escada", "descer", "Descer a escada"],
  ["V35-passear-cachorro", "passear", "Passear com o cachorro"],
  ["V36-cortar-papel-tesoura", "cortar", "Cortar papel"], ["V37-cortar-comida-prato", "cortar", "Cortar a comida"], ["V38-cortar-unhas", "cortar", "Cortar as unhas"],
  ["V39-cantar", "cantar", "Cantar"], ["V40-dancar", "dancar", "Dançar"],
  ["V41-jogar-dado", "jogar", "Jogar o dado"], ["V42-jogar-bola", "jogar", "Jogar a bola"],
  ["V43-pegar-brinquedo", "pegar", "Pegar o brinquedo"], ["V44-guardar-brinquedos", "guardar", "Guardar os brinquedos"],
  ["V45-encaixar-quebra-cabeca", "encaixar", "Encaixar o quebra-cabeça"], ["V46-encaixar-bloco", "encaixar", "Encaixar o bloco"],
  ["V47-comer", "comer", "Comer"], ["V48-beber-agua", "beber", "Beber água"],
];

const COLORS = ["yellow", "blue", "red", "green"];

/* ---------- ambiente ---------- */
function loadEnv(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
  );
}
const env = { ...loadEnv(path.resolve(ROOT, "../.env.local")), ...loadEnv(path.resolve(ROOT, ".env.local")), ...process.env };
if (!env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN ausente");

const db =
  target === "turso"
    ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
    : createClient({ url: `file:${path.resolve(ROOT, "data/neurominds.db")}` });

const blobPath = (id) => (RELEASE ? `acoes/${RELEASE}/${id}.mp4` : `acoes/${id}.mp4`);

/* ---------- 1. Blob ---------- */
async function uploadAll() {
  // urls[ID] = URL atual. Com --release, a URL precisa conter o caminho da release; senão, reenvia.
  const urls = existsSync(URLS_FILE) ? JSON.parse(readFileSync(URLS_FILE, "utf8")) : {};
  const pending = VIDEOS_PLAN.filter(([id]) => !urls[id] || !urls[id].includes(`/${blobPath(id)}`));
  console.log(`Blob (${RELEASE || "base"}): ${VIDEOS_PLAN.length - pending.length} já no lugar, ${pending.length} a enviar de ${SOURCE}`);
  const batch = 4;
  for (let i = 0; i < pending.length; i += batch) {
    await Promise.all(
      pending.slice(i, i + batch).map(async ([id]) => {
        const file = path.join(SOURCE, `${id}-som.mp4`);
        if (!existsSync(file)) throw new Error(`arquivo não encontrado: ${file}`);
        const blob = await put(blobPath(id), readFileSync(file), {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "video/mp4",
          token: env.BLOB_READ_WRITE_TOKEN,
        });
        urls[id] = blob.url;
        console.log("  ↑", id);
      }),
    );
    writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2) + "\n");
  }
  return { urls };
}

/* ---------- 2. Banco ---------- */
async function importDb(urls) {
  const max = await db.execute("SELECT COALESCE(MAX(sort_order), 0) AS m FROM action");
  let order = Number(max.rows[0].m);
  const existing = await db.execute("SELECT id, slug FROM action");
  const idBySlug = new Map(existing.rows.map((r) => [String(r.slug), String(r.id)]));
  let colorIdx = existing.rows.length;

  for (const [slug, [name, emoji]] of Object.entries(ACTIONS)) {
    if (idBySlug.has(slug)) continue;
    const id = randomUUID();
    await db.execute({
      sql: "INSERT INTO action (id, slug, name, emoji, color, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
      args: [id, slug, name, emoji, COLORS[colorIdx++ % 4], ++order],
    });
    idBySlug.set(slug, id);
    console.log("  + ação", name);
  }

  let added = 0, repointed = 0;
  for (const [vid, slug, caption] of VIDEOS_PLAN) {
    const actionId = idBySlug.get(slug);
    const src = urls[vid];
    // Linhas que apontam para outra versão do mesmo vídeo (…/acoes/<ID>.mp4, …/acoes/v1/<ID>.mp4) passam para a atual.
    const r = await db.execute({
      sql: "UPDATE video SET src = ? WHERE action_id = ? AND src LIKE ? AND src != ?",
      args: [src, actionId, `%/${vid}.mp4`, src],
    });
    repointed += r.rowsAffected;
    const dup = await db.execute({ sql: "SELECT 1 FROM video WHERE action_id = ? AND src = ?", args: [actionId, src] });
    if (dup.rows.length) continue;
    const m = await db.execute({ sql: "SELECT COALESCE(MAX(sort_order), 0) AS m FROM video WHERE action_id = ?", args: [actionId] });
    await db.execute({
      sql: "INSERT INTO video (id, action_id, src, caption, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)",
      args: [randomUUID(), actionId, src, caption, Number(m.rows[0].m) + 1],
    });
    added++;
  }
  console.log(`  + ${added} vídeos novos, ${repointed} apontados para a nova versão`);

  const empty = await db.execute(
    "UPDATE action SET is_active = 0 WHERE is_active = 1 AND NOT EXISTS (SELECT 1 FROM video v WHERE v.action_id = action.id AND v.is_active = 1)",
  );
  if (empty.rowsAffected) console.log(`  - ${empty.rowsAffected} ações sem vídeo desativadas`);

  const totals = await db.execute("SELECT (SELECT COUNT(*) FROM action WHERE is_active = 1) AS a, (SELECT COUNT(*) FROM video WHERE is_active = 1) AS v");
  console.log(`Banco (${target}): ${totals.rows[0].a} ações ativas, ${totals.rows[0].v} vídeos ativos`);
}

/* ---------- 3. Limpeza: blobs antigos que nenhum banco deve mais usar ---------- */
async function cleanup(urls) {
  // Só apaga quando o alvo é a produção: é o último banco a ser apontado para a versão nova.
  if (target !== "turso") return;
  const current = new Set(Object.values(urls));
  const stale = [];
  let cursor;
  do {
    const page = await list({ prefix: "acoes/", cursor, token: env.BLOB_READ_WRITE_TOKEN });
    for (const b of page.blobs) if (!current.has(b.url)) stale.push(b.url);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  if (!stale.length) return;
  await del(stale, { token: env.BLOB_READ_WRITE_TOKEN });
  console.log(`  🗑 ${stale.length} blobs antigos apagados`);
}

const { urls } = await uploadAll();
await importDb(urls);
await cleanup(urls);
