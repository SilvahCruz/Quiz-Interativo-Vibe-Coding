// Estado do quiz
const estadoQuiz = {
    perguntas: [],
    perguntaAtual: 0,
    pontuacao: 0,
    respostasSelecionadas: [],
    quizFinalizado: false,
    iaConectada: true
};

// DEFINIR ELEMENTOS DOM (ADICIONE ESTA PARTE)
const elementos = {
    btnIniciar: document.getElementById('btnIniciar'),
    telaInicial: document.getElementById('telaInicial'),
    telaLoading: document.getElementById('telaLoading'),
    statusGeracao: document.getElementById('statusGeracao'),
    telaQuiz: document.getElementById('telaQuiz'),
    perguntaElemento: document.getElementById('pergunta'),
    opcoesElemento: document.getElementById('opcoes'),
    categoriaElemento: document.getElementById('categoria'),
    contadorElemento: document.getElementById('contador'),
    telaResultado: document.getElementById('telaResultado'),
    pontuacaoFinal: document.getElementById('pontuacaoFinal')
};

// GERADOR DE PERGUNTAS DINÂMICAS - VERSÃO CORRIGIDA
class GeradorPerguntasIA {
    static async gerarPerguntasUnicas(quantidade = 5) { // Reduzido para teste
        console.log("🔄 Iniciando geração de perguntas...");
        const perguntas = [];
        const categoriasDisponiveis = [
            "Fórmula 1", "Geografia", "Matemática", "Charadas", 
            "Ciência" // Removidas categorias não implementadas
        ];
        
        for (let i = 0; i < quantidade; i++) {
            try {
                const categoriaIndex = i % categoriasDisponiveis.length; // Garante distribuição
                const categoria = categoriasDisponiveis[categoriaIndex];
                
                console.log(`📝 Gerando pergunta ${i + 1} de ${categoria}`);
                
                const pergunta = await this.criarPerguntaDinamica(categoria, i);
                
                if (pergunta && pergunta.pergunta && pergunta.opcoes) {
                    perguntas.push(pergunta);
                    console.log(`✅ Pergunta ${i + 1} gerada com sucesso`);
                } else {
                    console.warn(`⚠️ Pergunta ${i + 1} inválida, gerando alternativa`);
                    // Fallback para pergunta genérica
                    perguntas.push(this.perguntaFallback(i));
                }
                
                // Atualizar status visual se elemento existir
                if (elementos.statusGeracao) {
                    elementos.statusGeracao.textContent = 
                        `Gerando perguntas... ${i + 1}/${quantidade}`;
                }
                
                await this.delay(100); // Delay reduzido
                
            } catch (error) {
                console.error(`💥 Erro na pergunta ${i + 1}:`, error);
                perguntas.push(this.perguntaFallback(i));
            }
        }
        
        console.log("🎉 Geração concluída:", perguntas.length, "perguntas");
        return perguntas;
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static criarPerguntaDinamica(categoria, seed) {
        // 🔥 CORREÇÃO: Removido async/await desnecessário
        const timestamp = Date.now() + seed;
        
        switch(categoria) {
            case "Fórmula 1":
                return this.perguntaFormula1Dinamica(timestamp);
            case "Geografia":
                return this.perguntaGeografiaDinamica(timestamp);
            case "Matemática":
                return this.perguntaMatematicaDinamica(timestamp);
            case "Charadas":
                return this.perguntaCharadaDinamica(timestamp);
            case "Ciência":
                return this.perguntaCienciaDinamica(timestamp);
            default:
                return this.perguntaCulturaGeralDinamica(timestamp);
        }
    }

    // 🔥 ADICIONAR FUNÇÃO FALLBACK PARA ERROS
    static perguntaFallback(seed) {
        const perguntasFallback = [
            {
                pergunta: "Qual é a capital do Brasil?",
                opcoes: ["Brasília", "Rio de Janeiro", "São Paulo", "Belo Horizonte"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia",
                dificuldade: "fácil"
            },
            {
                pergunta: "Quanto é 2 + 2?",
                opcoes: ["3", "4", "5", "6"],
                respostaCorreta: 1,
                categoria: "🧮 Matemática", 
                dificuldade: "fácil"
            }
        ];
        
        return perguntasFallback[seed % perguntasFallback.length];
    }

    // 🔥 ADICIONAR FUNÇÃO CULTURA GERAL (para default case)
    static perguntaCulturaGeralDinamica(seed) {
        const perguntas = [
            {
                pergunta: "Qual é o maior oceano do mundo?",
                resposta: "Oceano Pacífico",
                opcoes: ["Oceano Pacífico", "Oceano Atlântico", "Oceano Índico", "Oceano Ártico"]
            },
            {
                pergunta: "Quantos continentes existem?",
                resposta: "7",
                opcoes: ["5", "6", "7", "8"]
            }
        ];

        const pergunta = perguntas[Math.floor(this.random(seed) * perguntas.length)];
        const opcoesEmbaralhadas = this.embaralharArray(pergunta.opcoes, seed + 1);

        return {
            pergunta: pergunta.pergunta,
            opcoes: opcoesEmbaralhadas,
            respostaCorreta: opcoesEmbaralhadas.indexOf(pergunta.resposta),
            categoria: "🌍 Cultura Geral",
            dificuldade: "fácil"
        };
    }

    // ... (mantenha as outras funções como perguntaFormula1Dinamica, etc.)

    // 🔥 CORREÇÃO NO gerarOpcoesNumericas
    static gerarOpcoesNumericas(correto, min, max, seed) {
        const opcoes = new Set();
        opcoes.add(correto.toString());
        
        while (opcoes.size < 4) {
            // Garantir que não fique em loop infinito
            if (opcoes.size > 10) break;
            
            const variacao = Math.floor(this.random(seed + opcoes.size) * (max - min + 1)) + min;
            // Evitar números repetidos ou muito próximos
            if (Math.abs(variacao - correto) > (max - min) * 0.1) {
                opcoes.add(variacao.toString());
            }
        }
        
        // Se não conseguiu 4 opções, completa com valores fixos
        if (opcoes.size < 4) {
            const opcoesFixas = [correto + 1, correto - 1, correto + 10, correto - 10];
            for (let opcao of opcoesFixas) {
                if (opcoes.size < 4) {
                    opcoes.add(opcao.toString());
                }
            }
        }
        
        return this.embaralharArray([...opcoes], seed + 100);
    }

    // ... (mantenha os outros métodos auxiliares)
}

// 🔥 FUNÇÃO INICIARQUIZ CORRIGIDA
async function iniciarQuiz() {
    console.log("🎯 Iniciando quiz...");
    
    try {
        // Verificar se elementos existem antes de usar
        if (elementos.btnIniciar) {
            elementos.btnIniciar.disabled = true;
            elementos.btnIniciar.textContent = "Gerando...";
        }
        
        mudarTela(elementos.telaInicial, elementos.telaLoading);
        
        if (elementos.statusGeracao) {
            elementos.statusGeracao.textContent = "Conectando com IA...";
        }
        
        // 🔥 CORREÇÃO: Timeout de segurança
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout na geração de perguntas")), 10000)
        );
        
        const geracaoPromise = GeradorPerguntasIA.gerarPerguntasUnicas(5);
        
        // Race entre geração e timeout
        estadoQuiz.perguntas = await Promise.race([geracaoPromise, timeoutPromise]);
        
        console.log("✅ Perguntas geradas com sucesso:", estadoQuiz.perguntas);
        
        // Verificar se há perguntas válidas
        if (!estadoQuiz.perguntas || estadoQuiz.perguntas.length === 0) {
            throw new Error("Nenhuma pergunta foi gerada");
        }
        
        mudarTela(elementos.telaLoading, elementos.telaQuiz);
        mostrarPergunta();
        
    } catch (error) {
        console.error("💥 Erro crítico:", error);
        
        // 🔥 FALLBACK: Usar perguntas fixas em caso de erro
        estadoQuiz.perguntas = [
            {
                pergunta: "Qual é a capital da França?",
                opcoes: ["Paris", "Londres", "Berlim", "Madri"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia",
                dificuldade: "fácil"
            },
            {
                pergunta: "Quanto é 5 × 8?",
                opcoes: ["35", "40", "45", "50"],
                respostaCorreta: 1,
                categoria: "🧮 Matemática",
                dificuldade: "fácil"
            }
        ];
        
        if (elementos.telaLoading && elementos.telaQuiz) {
            mudarTela(elementos.telaLoading, elementos.telaQuiz);
            mostrarPergunta();
        } else {
            // Último fallback
            alert('Quiz iniciado com perguntas básicas!');
            if (elementos.telaInicial) {
                mudarTela(elementos.telaLoading, elementos.telaInicial);
            }
            if (elementos.btnIniciar) {
                elementos.btnIniciar.disabled = false;
                elementos.btnIniciar.textContent = "Tentar Novamente";
            }
        }
    }
}

// 🔥 FUNÇÃO MUDAR TELA (se não existir)
function mudarTela(esconder, mostrar) {
    if (esconder) esconder.style.display = 'none';
    if (mostrar) mostrar.style.display = 'block';
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Quiz Galáctico IA Carregado");
    
    // Só adiciona event listener se o elemento existir
    if (elementos.btnIniciar) {
        elementos.btnIniciar.addEventListener('click', iniciarQuiz);
    } else {
        console.error("❌ Botão iniciar não encontrado");
    }
});