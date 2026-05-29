import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("NetGuardian AI: Gemini client successfully initialized with system API key.");
  } catch (err) {
    console.error("NetGuardian AI: Failed to initialize Gemini API client:", err);
  }
} else {
  console.log("NetGuardian AI: Missing or default GEMINI_API_KEY. Using state-of-the-art rule-based fallback optimization AI.");
}

// Global In-Memory Stateful Simulator
let simCards = [
  {
    id: "sim1",
    operator: "UNITEL" as const,
    phoneNumber: "+244 923 456 789",
    creditBalanceAOA: 2500,
    currentDataMB: 4200,
    totalDataLimitMB: 10240, // 10GB
    expiryDateStr: "2026-06-05",
    isActive: true,
  },
  {
    id: "sim2",
    operator: "AFRICELL" as const,
    phoneNumber: "+244 955 888 111",
    creditBalanceAOA: 1200,
    currentDataMB: 950,
    totalDataLimitMB: 5120, // 5GB
    expiryDateStr: "2026-06-01",
    isActive: false,
  }
];

let appsUsage = [
  {
    id: "app1",
    name: "SocialConnect (WhatsApp/FB)",
    packageName: "com.whatsapp.facebook",
    category: "social" as const,
    avatarColor: "bg-emerald-600",
    iconName: "MessageCircle",
    currentUsageMB: 1840,
    backgroundUsageMB: 480,
    isBlocked: false,
    isRestricted: false,
    hourlyTrendsMB: [12, 5, 2, 0, 1, 15, 30, 45, 60, 120, 180, 140, 95, 110, 100, 150, 130, 190, 220, 210, 160, 110, 45, 20],
  },
  {
    id: "app2",
    name: "VibeTube (YouTube)",
    packageName: "com.vibeteub.video",
    category: "streaming" as const,
    avatarColor: "bg-rose-600",
    iconName: "Youtube",
    currentUsageMB: 3950,
    backgroundUsageMB: 154,
    isBlocked: false,
    isRestricted: true,
    hourlyTrendsMB: [0, 0, 0, 0, 0, 5, 20, 40, 60, 80, 200, 310, 450, 320, 110, 90, 150, 340, 560, 680, 410, 120, 15, 0],
  },
  {
    id: "app3",
    name: "TikiToki (TikTok)",
    packageName: "com.tikitoki.shortvideo",
    category: "streaming" as const,
    avatarColor: "bg-fuchsia-600",
    iconName: "Video",
    currentUsageMB: 4810,
    backgroundUsageMB: 280,
    isBlocked: false,
    isRestricted: false,
    hourlyTrendsMB: [5, 0, 0, 0, 0, 0, 10, 25, 40, 50, 90, 120, 190, 450, 650, 710, 480, 320, 210, 560, 780, 610, 210, 30],
  },
  {
    id: "app4",
    name: "Angola Chrome (Navegador)",
    packageName: "com.angola.chrome",
    category: "web" as const,
    avatarColor: "bg-amber-500",
    iconName: "Globe",
    currentUsageMB: 620,
    backgroundUsageMB: 42,
    isBlocked: false,
    isRestricted: false,
    hourlyTrendsMB: [10, 2, 0, 0, 0, 4, 15, 22, 35, 40, 50, 48, 42, 38, 55, 62, 48, 50, 42, 30, 25, 20, 15, 12],
  },
  {
    id: "app5",
    name: "Atualizações do Sistema",
    packageName: "com.android.system.update",
    category: "updates" as const,
    avatarColor: "bg-blue-600",
    iconName: "RefreshCw",
    currentUsageMB: 1420,
    backgroundUsageMB: 1390,
    isBlocked: false,
    isRestricted: true,
    hourlyTrendsMB: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1200, 220, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
];

let notifications = [
  {
    id: "notif_1",
    title: "Vazamento de Dados Detectado!",
    message: "O aplicativo 'TikiToki (TikTok)' consumiu 280MB em segundo plano nas últimas 3 horas.",
    type: "warning" as const,
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    appName: "TikiToki (TikTok)"
  },
  {
    id: "notif_2",
    title: "Limite Diário Quase Atingido",
    message: "Atingiu 85% do limite diário recomendado para o pacote UNITEL.",
    type: "critical" as const,
    timestamp: "14:23",
    isRead: false
  },
  {
    id: "notif_3",
    title: "Modo Super Poupança Ativo",
    message: "NetGuardian bloqueou com sucesso sincronizações desnecessárias do sistema.",
    type: "success" as const,
    timestamp: "09:12",
    isRead: true
  }
];

// Angolan Mobile Tariffs Reference
const ORA_BUNDLES = [
  { id: "u1", operator: "UNITEL", name: "Net+ 1GB Noite", priceAOA: 500, volumeMB: 1024, validityDays: 1, description: "Perfeito para downloads rápidos da meia-noite às 5h." },
  { id: "u2", operator: "UNITEL", name: "Dez 3.5GB 3 Dias", priceAOA: 1000, volumeMB: 3584, validityDays: 3, description: "Plano económico mais equilibrado de Angola." },
  { id: "u3", operator: "UNITEL", name: "Estudante Net 5GB", priceAOA: 2000, volumeMB: 5120, validityDays: 7, description: "Ecológico e ideal para trabalhos académicos." },
  { id: "u4", operator: "UNITEL", name: "Plano Mensal 12GB", priceAOA: 5000, volumeMB: 12288, validityDays: 30, description: "Acesso permanente para pequenas empresas/estudos." },
  
  { id: "a1", operator: "AFRICELL", name: "Kamba Net Diário 750MB", priceAOA: 150, volumeMB: 750, validityDays: 1, description: "A internet mais barata para emergência escolar." },
  { id: "a2", operator: "AFRICELL", name: "Kamba Net Semanal 4GB", priceAOA: 1000, volumeMB: 4096, validityDays: 7, description: "Super generoso para WhatsApp e Instagram." },
  { id: "a3", operator: "AFRICELL", name: "Kamba Net Mensal 15GB", priceAOA: 4000, volumeMB: 15360, validityDays: 30, description: "Melhor custo benefício por Gigabyte em Luanda." },
  
  { id: "m1", operator: "MOVICEL", name: "Kuzola Net 1.5GB", priceAOA: 800, volumeMB: 1536, validityDays: 3, description: "Internet estável com bónus de SMS inclusos." },
  { id: "m2", operator: "MOVICEL", name: "NetGiga Semanal 6GB", priceAOA: 2500, volumeMB: 6144, validityDays: 7, description: "Ideal para freelancers em províncias fora de Luanda." }
];

// ---- API REST ENDPOINTS ----

// 1. Get current SIM card setups
app.get("/api/sims", (req, res) => {
  res.json(simCards);
});

// Update active SIM card
app.post("/api/sims/activate", (req, res) => {
  const { id } = req.body;
  simCards = simCards.map(s => ({
    ...s,
    isActive: s.id === id
  }));
  res.json({ success: true, sims: simCards });
});

// 2. Add airtime / recharge
app.post("/api/sims/recharge", (req, res) => {
  const { id, amountAOA } = req.body;
  const sim = simCards.find(s => s.id === id);
  if (sim) {
    sim.creditBalanceAOA += amountAOA;
    res.json({ success: true, sim });
  } else {
    res.status(404).json({ error: "SIM Card não encontrado" });
  }
});

// 3. Purchase a local package
app.post("/api/sims/buy-bundle", (req, res) => {
  const { simId, bundleId } = req.body;
  const sim = simCards.find(s => s.id === simId);
  const bundle = ORA_BUNDLES.find(b => b.id === bundleId);

  if (!sim || !bundle) {
    return res.status(404).json({ error: "SIM ou Pacote Inválido" });
  }

  if (sim.creditBalanceAOA < bundle.priceAOA) {
    return res.status(400).json({ error: `Saldo insuficiente. Precisa de pelo menos ${bundle.priceAOA} AOA.` });
  }

  // Deduct credit, add mobile data
  sim.creditBalanceAOA -= bundle.priceAOA;
  sim.currentDataMB += bundle.volumeMB;
  sim.totalDataLimitMB = Math.max(sim.totalDataLimitMB, sim.currentDataMB + 1000); // adjust threshold

  // Add system notification
  const textMsg = `Pacote '${bundle.name}' ativado com sucesso! +${(bundle.volumeMB / 1024).toFixed(1)}GB disponíveis.`;
  notifications.unshift({
    id: `notif_${Date.now()}`,
    title: "Pacote Ativado",
    message: textMsg,
    type: "success",
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    isRead: false
  });

  res.json({ success: true, sim, message: textMsg, notifications });
});

// 4. Get tracked App usage
app.get("/api/apps", (req, res) => {
  res.json(appsUsage);
});

// Toggle block State
app.post("/api/apps/toggle-block", (req, res) => {
  const { id } = req.body;
  const appItem = appsUsage.find(a => a.id === id);
  if (appItem) {
    appItem.isBlocked = !appItem.isBlocked;
    res.json({ success: true, app: appItem });
  } else {
    res.status(404).json({ error: "Aplicativo não encontrado" });
  }
});

// Toggle restricted video mode
app.post("/api/apps/toggle-restrict", (req, res) => {
  const { id } = req.body;
  const appItem = appsUsage.find(a => a.id === id);
  if (appItem) {
    appItem.isRestricted = !appItem.isRestricted;
    res.json({ success: true, app: appItem });
  } else {
    res.status(404).json({ error: "Aplicativo não encontrado" });
  }
});

// 5. App usage optimization reset / simulated live simulator stream API
app.post("/api/simulator/tick", (req, res) => {
  const { economySettings } = req.body;
  
  // Find active SIM card
  const activeSim = simCards.find(s => s.isActive);
  if (!activeSim) return res.status(400).json({ error: "Nenhum cartão SIM ativo" });

  let totalConsumedThisTick = 0;

  // Let's modify usage slightly based on active rules. If economySettings are intensive, consumption is heavily throttled
  appsUsage = appsUsage.map(appItem => {
    if (appItem.isBlocked) return appItem;

    let baseUsage = Math.random() * 8 + 1; // background active spike
    
    // category scaling
    if (appItem.category === 'streaming') baseUsage *= 3.5;
    if (appItem.category === 'social') baseUsage *= 1.8;

    // Reductions from economy settings
    if (appItem.isRestricted) {
      baseUsage *= 0.35; // Save 65% with specific restriction
    }
    if (economySettings.videoQualityLimit === 'low' && appItem.category === 'streaming') {
      baseUsage *= 0.4; // Save more on streaming
    }
    if (economySettings.blockBackgroundData) {
      // background consumption becomes near 0
      appItem.backgroundUsageMB += 0.01;
      baseUsage *= 0.65; 
    } else {
      const backgroundLeak = Math.random() * 1.5;
      appItem.backgroundUsageMB += backgroundLeak;
      baseUsage += backgroundLeak;
    }

    appItem.currentUsageMB += Number(baseUsage.toFixed(1));
    totalConsumedThisTick += baseUsage;

    return appItem;
  });

  // Deduct from SIM's remaining data
  const actualUsageMB = Number(totalConsumedThisTick.toFixed(1));
  activeSim.currentDataMB = Math.max(0, activeSim.currentDataMB - actualUsageMB);

  // Trigger low data warning if remaining below 300MB
  if (activeSim.currentDataMB <= 300 && activeSim.currentDataMB > 0) {
    const warningExists = notifications.some(n => n.title === "Pacote Praticamente Esgotado!");
    if (!warningExists) {
      notifications.unshift({
        id: `notif_${Date.now()}`,
        title: "Pacote Praticamente Esgotado!",
        message: `Atenção: A sua internet móvel está com apenas ${activeSim.currentDataMB.toFixed(0)}MB de limite. Compre outro plano ou ative o Bloqueio Total para evitar descontar do saldo principal.`,
        type: "critical",
        timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      });
    }
  }

  res.json({ success: true, sims: simCards, apps: appsUsage, consumedMB: actualUsageMB, notifications });
});

// Get reference bundles
app.get("/api/tariffs", (req, res) => {
  res.json(ORA_BUNDLES);
});

// Notifications API
app.get("/api/notifications", (req, res) => {
  res.json(notifications);
});

app.post("/api/notifications/mark-read", (req, res) => {
  notifications = notifications.map(n => ({ ...n, isRead: true }));
  res.json({ success: true, notifications });
});

// --- AI INTELLIGENT ROUTE : OPTIMIZE ---
// Generates expert analytics on data optimization for Angola using Gemini or localized heuristic fallback

app.post("/api/gemini/optimize", async (req, res) => {
  const { apps, activeSim, economySettings } = req.body;

  const summaryDataStr = `
SIM ATIVO: ${activeSim ? `${activeSim.operator} (${activeSim.phoneNumber}) com ${activeSim.currentDataMB.toFixed(0)}MB restantes de ${activeSim.totalDataLimitMB}MB` : 'Nenhum'}
ESTADO DE POUPANÇA: Sincronização em Segundo Plano está ${economySettings.blockBackgroundData ? 'BLOQUEADA' : 'LIBERADA'}. Resolução de vídeos em '${economySettings.videoQualityLimit.toUpperCase()}'.
APLICATIVOS REGISTADOS:
${apps.map((a: any) => `- ${a.name}: Consumo ${a.currentUsageMB.toFixed(0)}MB (Sendo ${a.backgroundUsageMB.toFixed(0)}MB em segundo plano). Bloqueado? ${a.isBlocked ? 'SIM' : 'NÃO'}. Restrito? ${a.isRestricted ? 'SIM' : 'NÃO'}.`).join('\n')}
  `;

  const prompt = `
Aja como o assistente virtual de inteligência artificial de economia digital de banda larga "Cunene AI Reporter" da aplicação NetGuardian AI.
Analise detalhadamente o perfil de consumo e poupança de internet móvel do utilizador em Angola abaixo:

${summaryDataStr}

Forneça uma análise otimizada, extremamente estruturada e perspicaz em formato Markdown com os seguintes pontos:
1. **Grau de Eficiência Digital (A+ até F)**: Dê uma nota justificada à performance de dados do utilizador.
2. **Ponto de Alarme Crítico (Vazamentos)**: Identifique nominalmente qual o app que está a causar o pior desperdício de dados e justifique com números reais fornecidos.
3. **Previsão Avançada de Duração**: Faça um cálculo de IA simples estimando quanto tempo durará o pacote com base no uso de streaming e WhatsApp.
4. **Combinação de Planos Recomendada (Angola)**: Sugira uma estratégia de combinação inteligente usando os tarifários reais de Angola baseando-se no operador ativo (${activeSim ? activeSim.operator : 'UNITEL'}). Recomende o uso do plano "Net+ Noite" (UNITEL 500 AOA) ou "Kamba Net Africell" para aliviar dados durante as horas certas.

Responda em PORTUGUÊS DE ANGOLA nativo, mantendo um tom de autoridade futurista, profissional, empático e de alta startup tecnológica. Evite frases robóticas, foque nas dores de dados caros (Kwanza/AOA economizado é importante!).
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o assistente virtual sênior de eficiência de internet móvel 'Cunene AI', especialista nos pacotes de operadoras de Angola (Unitel, Africell e Movicel)."
        }
      });
      return res.json({ text: response.text });
    } catch (err) {
      console.error("Gemini optimization service failure:", err);
      // Fallback
    }
  }

  // Pure Rule-based fallback if API key is not ready
  const worstApp = apps.reduce((prev: any, current: any) => (prev.currentUsageMB > current.currentUsageMB) ? prev : current, apps[0]);
  const localizedFallBackMarkdown = `
### 🛡️ Relatório de Otimização Inteligente — Cunene AI (Modo Local Estável)

Olá! Eu sou o **Cunene AI**, o teu guardião cibernético de dados móveis em Angola. Analisei o teu consumo de internet móvel e aqui estão as minhas previsões e conselhos em tempo real:

#### 1. Grau de Eficiência Digital: **C+ (Intermédio)**
* O teu perfil demonstra uma boa tentativa de poupança ao limitar a qualidade de vídeo para **${economySettings.videoQualityLimit.toUpperCase()}**, mas podes melhorar substancialmente ao bloquear mais apps de segundo plano de alta drenagem.

#### 2. Alarme Crítico de Desperdício 🚨
* O vilão atual do teu saldo de dados é o aplicativo **${worstApp ? worstApp.name : 'TikiToki (TikTok)'}**, que já consumiu **${worstApp ? worstApp.currentUsageMB.toFixed(0) : '4810'}MB**. 
* **Vazamento Secundário:** Detetamos que o consumo em segundo plano deste app representa uma perda invisível significativa em Kwanzas no teu saldo principal.

#### 3. Previsão de Duração de IA 📅
* Com base no teu consumo diário acumulado estimado de **450MB/dia**, o teu pacote de internet ativo possui uma estimativa média de sobrevivência de apenas **${activeSim ? (activeSim.currentDataMB / 450).toFixed(1) : '3'} dias úteis**. 
* Se não alterares os teus padrões, o pacote expirará antes de **${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO')}**.

#### 4. Estratégia de Combinação Tarifária Recomendada 🇦🇴
* Reparámos que estás a utilizar a rede **${activeSim ? activeSim.operator : 'UNITEL'}**. Aqui está a estratégia ideal para poupar Kwanzas:
  * **Estratégia de Downloads Pesados:** Subscreve o plano **Net+ Noite de 1GB por apenas 500 AOA** da Unitel (válido da 00h às 05h). Programa o NetGuardian para descarregar atualizações e sincronizar fotos apenas neste intervalo!
  * **Estratégia Diária:** Se tiveres acesso à rede **AFRICELL**, o plano **Kamba Net Semanal de 4GB por 1000 AOA** resulta no custo imbatível de apenas 250 AOA/GB nos bairros urbanos de Luanda.
  `;
  res.json({ text: localizedFallBackMarkdown });
});

// 6. Conversational Chat Agent
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, activeSim } = req.body;
  if (!messages || messages.length === 0) return res.status(400).json({ error: "Mensagem vazia." });

  const lastUserMessage = messages[messages.length - 1].text;

  const currentSimContext = activeSim 
    ? `O utilizador está atualmente com um cartão SIM da ${activeSim.operator} ativo, saldo de dados actual de ${activeSim.currentDataMB.toFixed(0)}MB e saldo em dinheiro de ${activeSim.creditBalanceAOA} AOA.`
    : "Não há SIM selecionado no momento.";

  const systemInstructions = `
Você é o "Cunene AI Assistant", o assistente inteligente de eficiência de dados integrado do NetGuardian AI.
Seu objetivo é dar conselhos e responder a perguntas do utilizador em Angola e África sobre como poupar dados móveis de internet, tarifas móveis, consumo oculto e problemas de sinal móvel.

Apoie-se nos seguintes factos reais sobre Angola:
- Operadoras: UNITEL (líder, pacotes populares: Dez, Net+), AFRICELL (mais barata, expandindo para Benguela, Lubango, etc.), MOVICEL (Kuzola).
- Moeda: Kwanza (AOA).
- Preços: A internet é muito cara em Angola em relação ao salário médio. As conexões frequentemente oscilam entre 3G e 4G.
- Estilo linguístico: Português de Angola amigável, educado, utilizando gírias locais sutis como "maninho", "kambas", "bazar", "madié", "saldo", "pacote", "kwanzas" se fizer sentido, mas mantendo a seriedade de um assistente de IA premium.

Contexto Técnico Atual: ${currentSimContext}
  `;

  if (ai) {
    try {
      // Create chat thread format
      const contentList = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...contentList
        ],
        config: {
          systemInstruction: systemInstructions
        }
      });
      return res.json({ text: response.text });
    } catch (err) {
      console.error("Gemini Chat service failure:", err);
    }
  }

  // Pre-baked rule-based clever agent responses for typical questions
  let responseText = `Olá! Sou o Cunene AI. Desculpa, de momento o meu canal de comunicações satélite principal está em modo offline simplificado (sem internet), mas conheço perfeitamente as tuas necessidades!

Podes perguntar-me sobre:
1. "Como poupar bateria e dados no TikTok/Instagram?"
2. "Quais os melhores planos Unitel ou Africell de Angola?"
3. "Como funciona o temporizador inteligente de madrugada do NetGuardian?"

Se me perguntaste algo específico: recomendo-te vivamente bloquear redes sociais secundárias no painel 'Network Apps' do NetGuardian AI e limitar todos os downloads para a meia-noite usando o nosso agendador inteligente de 500 AOA diários!`;

  const normalizedQuery = lastUserMessage.toLowerCase();
  if (normalizedQuery.includes("unitel") || normalizedQuery.includes("dez") || normalizedQuery.includes("plano")) {
    responseText = `Madié, na **UNITEL** o segredo para economizar de verdade é usar os planos inteligentes:
1. **Plano de Dez (1.000 AOA por 3.5GB por 3 dias):** É uma das melhores ofertas para quem precisa de navegar de forma equilibrada sem gastar muito de uma vez.
2. **Net+ Noite (500 AOA por 1GB das 00h às 05h):** Perfeito para atualizar todos os teus aplicativos de uma vez ou descarregar cursos sem queimar o teu saldo principal durante o dia.
3. **Estudante (2.000 AOA por 5GB por 7 Dias):** Ideal se tiveres uma conta verificada de estudante ou pontos Unitel!

No teu NetGuardian, ative a opção **Night Scheduler** para direcionar atualizações de sistema somente para as madrugadas!`;
  } else if (normalizedQuery.includes("africell") || normalizedQuery.includes("kamba") || normalizedQuery.includes("barato")) {
    responseText = `Olha, a **AFRICELL** chegou forte com preços muito competitivos!
1. **Kamba Net Semanal (1.000 AOA por 4GB):** Dá-te gigas generosos para navegares no WhatsApp, Tik Tok e veres vídeos rápidos.
2. **Kamba Net Mensal (4.000 AOA por 15GB):** Para quem faz teletrabalho ou estuda em Luanda, é de longe o preço por Gigabyte mais atraente de Angola de momento.

**Dica do NetGuardian:** Como os limites da Africell são grandes, vale a pena ativar o temporizador no browser para monitorar se o Instagram não consome em background!`;
  } else if (normalizedQuery.includes("tiktok") || normalizedQuery.includes("instagram") || normalizedQuery.includes("desperdicio") || normalizedQuery.includes("poupar")) {
    responseText = `Maninho, o Tik Tok e o Instagram são autênticas "aspiradoras" de saldo de internet! Um vídeo de 15 segundos em Full HD consome até 25MB sem dares conta!
Aqui está a receita de poupança imediata:
1. **Ative a Restrição Individual no NetGuardian:** Clique no ícone de escudo verde ao lado do TikiToki na nossa lista de aplicativos. Isso força o nosso agente de proxy local simulado a comprimir o conteúdo para 360p.
2. **Cortar Dados em Background:** Ativa o interruptor **Bloquear Dados em Segundo Plano** no tab de configurações. Sabe que apps de redes sociais continuam a carregar vídeos mesmo quando o ecrã do teu telefone está trancado!
3. **Modo Extreme Saving:** Define o teto de 150MB diários no nosso painel, assim evitas que os miúdos gastem o teu pacote principal sem quereres!`;
  }

  res.json({ text: responseText });
});


// ---- INTEGRATE VITE ENGINE OR STATIC ASSET PRODUCTION ----
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware enabled.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Static files production serving enabled for dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NetGuardian AI full-stack container initialized successfully.`);
    console.log(`Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
