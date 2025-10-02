// Estado do quiz
const estadoQuiz = {
    perguntas: [],
    perguntaAtual: 0,
    pontuacao: 0,
    quizFinalizado: false,
    tempoRestante: 15,
    timer: null,
    respostaSelecionada: false
};

// Histórico de perguntas usadas
const historicoPerguntas = {
    quizAnterior: [], // Perguntas usadas no último quiz
    quizAntesDoAnterior: [] // Perguntas usadas no quiz anterior ao último
};

// ADICIONE ESTAS VARIÁVEIS NO INÍCIO DO JAVASCRIPT
const elementos = {
    telaInicial: document.getElementById('telaInicial'),
    telaLoading: document.getElementById('telaLoading'),
    telaQuiz: document.getElementById('telaQuiz'),
    btnIniciar: document.getElementById('btnIniciar'),
    statusGeracao: document.getElementById('statusGeracao'),
    perguntaElemento: document.getElementById('pergunta'),
    opcoesElemento: document.getElementById('opcoes'),
    categoriaElemento: document.getElementById('categoria'),
    contadorElemento: document.getElementById('contador'),
    barraTempo: document.getElementById('barraTempo'),
    tempoRestanteElemento: document.getElementById('tempoRestante'),
    contadorTempoElemento: document.getElementById('contadorTempo'),
    // ... elementos existentes ...
    telaResultado: document.getElementById('telaResultado'),
    pontuacaoFinal: document.getElementById('pontuacaoFinal'),
    questoesErradas: document.getElementById('questoesErradas'),
    porcentagemFinal: document.getElementById('porcentagemFinal'),
    barraDesempenho: document.getElementById('barraDesempenho'),
    mensagemMotivacional: document.getElementById('mensagemMotivacional'),
    corretasCount: document.getElementById('corretasCount'),
    erradasCount: document.getElementById('erradasCount'),
    tempoMedio: document.getElementById('tempoMedio'),
    iconeResultado: document.getElementById('iconeResultado'),
    btnNovaMissao: document.getElementById('btnNovaMissao')
};

// ADICIONE ESTA VARIÁVEL PARA CONTROLAR O TEMPO
let tempoInicioQuiz = null;

// CRIAR ELEMENTOS ESPACIAIS
function criarElementosEspaciais() {
    const body = document.body;
    
    for (let i = 0; i < 50; i++) {
        const estrela = document.createElement('div');
        estrela.className = 'estrela';
        estrela.style.width = Math.random() * 3 + 1 + 'px';
        estrela.style.height = estrela.style.width;
        estrela.style.left = Math.random() * 100 + 'vw';
        estrela.style.top = Math.random() * 100 + 'vh';
        estrela.style.animationDelay = Math.random() * 3 + 's';
        body.appendChild(estrela);
    }
    
    for (let i = 0; i < 5; i++) {
        const cometa = document.createElement('div');
        cometa.className = 'cometa';
        cometa.style.left = Math.random() * 100 + 'vw';
        cometa.style.top = Math.random() * 100 + 'vh';
        cometa.style.animationDelay = Math.random() * 8 + 's';
        body.appendChild(cometa);
    }
    
    for (let i = 0; i < 3; i++) {
        const saturno = document.createElement('div');
        saturno.className = 'saturno';
        saturno.style.left = Math.random() * 80 + 10 + 'vw';
        saturno.style.top = Math.random() * 80 + 10 + 'vh';
        saturno.style.animationDelay = Math.random() * 5 + 's';
        body.appendChild(saturno);
    }
}

// ATUALIZE A FUNÇÃO mostrarTela PARA INCLUIR A TELA DE RESULTADO
function mostrarTela(nomeTela) {
    elementos.telaInicial.classList.remove('tela-ativa');
    elementos.telaLoading.classList.remove('tela-ativa');
    elementos.telaQuiz.classList.remove('tela-ativa');
    elementos.telaResultado.classList.remove('tela-ativa');
    
    switch(nomeTela) {
        case 'inicial':
            elementos.telaInicial.classList.add('tela-ativa');
            break;
        case 'loading':
            elementos.telaLoading.classList.add('tela-ativa');
            break;
        case 'quiz':
            elementos.telaQuiz.classList.add('tela-ativa');
            break;
        case 'resultado':
            elementos.telaResultado.classList.add('tela-ativa');
            break;
    }
}

// GERADOR DE PERGUNTAS COM SISTEMA DE COOLDOWN E MATEMÁTICA CORRIGIDA
class GeradorPerguntasIA {
    static async gerarPerguntasUnicas(quantidade = 8) {
        console.log("🚀 IA Gerando perguntas aleatórias...");
        const todasPerguntas = this.obterTodasPerguntas();
        
        // Filtrar perguntas que podem ser usadas (não estão no quiz anterior)
        const perguntasDisponiveis = todasPerguntas.filter(pergunta => 
            !historicoPerguntas.quizAnterior.some(p => p.pergunta === pergunta.pergunta)
        );
        
        console.log(`📊 Perguntas disponíveis: ${perguntasDisponiveis.length}/${todasPerguntas.length}`);
        
        // Se não há perguntas suficientes, liberar algumas do quiz anterior
        let perguntasParaUsar = [...perguntasDisponiveis];
        if (perguntasParaUsar.length < quantidade) {
            const perguntasAdicionais = historicoPerguntas.quizAnterior.slice(0, quantidade - perguntasParaUsar.length);
            perguntasParaUsar = [...perguntasParaUsar, ...perguntasAdicionais];
            console.log(`🔄 Usando ${perguntasAdicionais.length} perguntas do quiz anterior por falta de opções`);
        }
        
        // Embaralhar as perguntas disponíveis
        const perguntasEmbaralhadas = this.embaralharArray([...perguntasParaUsar]);
        
        const perguntasSelecionadas = [];
        for (let i = 0; i < quantidade && i < perguntasEmbaralhadas.length; i++) {
            if (elementos.statusGeracao) {
                elementos.statusGeracao.textContent = `Gerando pergunta ${i + 1}/${quantidade}...`;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // EMBARALHAR AS OPÇÕES DE RESPOSTA
            const perguntaComOpcoesEmbaralhadas = this.embaralharOpcoesResposta(perguntasEmbaralhadas[i]);
            perguntasSelecionadas.push(perguntaComOpcoesEmbaralhadas);
        }
        
        console.log("✅ Perguntas selecionadas:", perguntasSelecionadas.length);
        
        // Atualizar histórico
        this.atualizarHistorico(perguntasSelecionadas);
        
        return perguntasSelecionadas;
    }

    static atualizarHistorico(novasPerguntas) {
        // Mover quiz anterior para "quizAntesDoAnterior"
        historicoPerguntas.quizAntesDoAnterior = [...historicoPerguntas.quizAnterior];
        
        // Atualizar quiz anterior com as novas perguntas
        historicoPerguntas.quizAnterior = novasPerguntas.map(p => ({
            pergunta: p.pergunta,
            categoria: p.categoria
        }));
        
        console.log("📝 Histórico atualizado:");
        console.log("- Quiz anterior:", historicoPerguntas.quizAnterior.length, "perguntas");
        console.log("- Quiz antes do anterior:", historicoPerguntas.quizAntesDoAnterior.length, "perguntas");
    }

    static embaralharOpcoesResposta(pergunta) {
        const opcoesComIndices = pergunta.opcoes.map((opcao, index) => ({ opcao, index }));
        const opcoesEmbaralhadas = this.embaralharArray([...opcoesComIndices]);
        const novaPosicaoCorreta = opcoesEmbaralhadas.findIndex(item => item.index === pergunta.respostaCorreta);
        
        return {
            ...pergunta,
            opcoes: opcoesEmbaralhadas.map(item => item.opcao),
            respostaCorreta: novaPosicaoCorreta
        };
    }

    static obterTodasPerguntas() {
        return [
            // 🏎️ FÓRMULA 1 (10 perguntas)
            {
                pergunta: "Quantos títulos mundiais Lewis Hamilton possui?",
                opcoes: ["7", "6", "8", "5"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Em que ano Ayrton Senna conquistou seu primeiro título?",
                opcoes: ["1988", "1990", "1991", "1994"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Qual equipe tem mais títulos de construtores na F1?",
                opcoes: ["Ferrari", "Mercedes", "Williams", "McLaren"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Quantas vitórias Michael Schumacher tem na F1?",
                opcoes: ["91", "87", "95", "99"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Qual piloto brasileiro tem mais vitórias na F1?",
                opcoes: ["Ayrton Senna", "Nelson Piquet", "Felipe Massa", "Emerson Fittipaldi"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Em que circuito é realizado o GP do Brasil?",
                opcoes: ["Interlagos", "Monza", "Silverstone", "Monaco"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Quantas equipes competem atualmente na F1 (2024)?",
                opcoes: ["10", "12", "8", "15"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Qual piloto tem mais pole positions na história?",
                opcoes: ["Lewis Hamilton", "Michael Schumacher", "Ayrton Senna", "Sebastian Vettel"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Em que ano a F1 foi criada?",
                opcoes: ["1950", "1948", "1955", "1960"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },
            {
                pergunta: "Qual é o circuito mais lento do calendário?",
                opcoes: ["Monaco", "Singapura", "Hungaroring", "Monza"],
                respostaCorreta: 0,
                categoria: "🏎️ Fórmula 1"
            },

            // 🌎 GEOGRAFIA (10 perguntas)
            {
                pergunta: "Qual é a capital do Brasil?",
                opcoes: ["Brasília", "Rio de Janeiro", "São Paulo", "Belo Horizonte"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual é o maior oceano do mundo?",
                opcoes: ["Pacífico", "Atlântico", "Índico", "Ártico"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Em qual continente está o Egito?",
                opcoes: ["África", "Ásia", "Europa", "América do Sul"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual é o maior país do mundo em área?",
                opcoes: ["Rússia", "Canadá", "China", "Estados Unidos"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual é o rio mais longo do mundo?",
                opcoes: ["Nilo", "Amazonas", "Yangtzé", "Mississippi"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual destes países não faz fronteira com o Brasil?",
                opcoes: ["Chile", "Argentina", "Paraguai", "Bolívia"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual é o menor país do mundo?",
                opcoes: ["Vaticano", "Mônaco", "San Marino", "Liechtenstein"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Em que continente está a Austrália?",
                opcoes: ["Oceania", "Ásia", "Europa", "América"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual é o ponto mais alto da Terra?",
                opcoes: ["Monte Everest", "K2", "Mont Blanc", "Aconcágua"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },
            {
                pergunta: "Qual destas cidades não é uma capital?",
                opcoes: ["Sydney", "Camberra", "Wellington", "Ottawa"],
                respostaCorreta: 0,
                categoria: "🌎 Geografia"
            },

            // 🧮 MATEMÁTICA CORRIGIDA (15 perguntas)
            {
                pergunta: "Quanto é 15 + 27?",
                opcoes: ["42", "43", "41", "44"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 8 × 7?",
                opcoes: ["56", "54", "58", "60"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Qual é a raiz quadrada de 144?",
                opcoes: ["12", "14", "16", "18"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 3/4 de 100?",
                opcoes: ["75", "70", "80", "65"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Qual é o valor de π (pi) aproximadamente?",
                opcoes: ["3.1416", "3.1516", "3.1316", "3.1716"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 5² + 3³?",
                opcoes: ["52", "34", "36", "38"],
                respostaCorreta: 0, // 25 + 27 = 52
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Qual é a soma dos ângulos internos de um triângulo?",
                opcoes: ["180°", "90°", "360°", "270°"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 25% de 200?",
                opcoes: ["50", "40", "60", "75"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Qual destes números é primo?",
                opcoes: ["17", "15", "21", "27"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 12 × 11?",
                opcoes: ["132", "121", "144", "123"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 9² - 4²?",
                opcoes: ["65", "72", "81", "56"],
                respostaCorreta: 0, // 81 - 16 = 65
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Qual é o resultado de 7 × 8 + 5?",
                opcoes: ["61", "56", "66", "51"],
                respostaCorreta: 0, // 56 + 5 = 61
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é a metade de 3/4?",
                opcoes: ["3/8", "1/2", "2/3", "1/4"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Qual é o MMC de 6 e 8?",
                opcoes: ["24", "12", "48", "16"],
                respostaCorreta: 0,
                categoria: "🧮 Matemática"
            },
            {
                pergunta: "Quanto é 100 ÷ 4 × 2?",
                opcoes: ["50", "25", "100", "200"],
                respostaCorreta: 0, // 25 × 2 = 50
                categoria: "🧮 Matemática"
            },

            // 🤔 CHARADAS (10 perguntas)
            {
                pergunta: "O que é que quanto mais se tira, maior fica?",
                opcoes: ["O buraco", "A árvore", "O rio", "A montanha"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que sobe e desce sem nunca se mover?",
                opcoes: ["A temperatura", "O elevador", "A escada", "A maré"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "Tenho cidades, mas não tenho casas; tenho florestas, mas não tenho árvores; tenho rios, mas não tenho água. O que sou?",
                opcoes: ["Um mapa", "Um sonho", "Um livro", "Um quebra-cabeça"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "Quanto mais você tem, menos você vê. O que é?",
                opcoes: ["A escuridão", "O dinheiro", "O conhecimento", "O tempo"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que é que tem chaves mas não abre portas?",
                opcoes: ["O piano", "O carro", "O cofre", "A gaveta"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que é que sempre vem mas nunca chega?",
                opcoes: ["O amanhã", "O trem", "O verão", "A resposta"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que é que quebra quando você diz o nome dele?",
                opcoes: ["O silêncio", "O vidro", "O espelho", "O coração"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que é que você pode segurar sem tocar?",
                opcoes: ["A respiração", "A conversa", "O pensamento", "A promessa"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que é que quanto mais longo, menos você vê?",
                opcoes: ["A escuridão", "O tempo", "A estrada", "A noite"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },
            {
                pergunta: "O que é que todos têm mas ninguém pode perder?",
                opcoes: ["A sombra", "O nome", "A idade", "O passado"],
                respostaCorreta: 0,
                categoria: "🤔 Charadas"
            },

            // 🔬 CIÊNCIA (10 perguntas)
            {
                pergunta: "Qual é o elemento químico mais abundante no universo?",
                opcoes: ["Hidrogênio", "Oxigênio", "Carbono", "Hélio"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Quantos planetas existem no nosso sistema solar?",
                opcoes: ["8", "9", "7", "10"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Qual é a velocidade da luz no vácuo?",
                opcoes: ["299.792.458 m/s", "300.000.000 m/s", "150.000.000 m/s", "1.080.000.000 km/h"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Qual destes não é um estado da matéria?",
                opcoes: ["Fogo", "Sólido", "Líquido", "Gasoso"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Quantos elementos tem a tabela periódica (2024)?",
                opcoes: ["118", "115", "120", "125"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Qual é o planeta mais próximo do Sol?",
                opcoes: ["Mercúrio", "Vênus", "Terra", "Marte"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Quantos ossos tem o corpo humano adulto?",
                opcoes: ["206", "195", "215", "180"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Qual é o gás mais abundante na atmosfera terrestre?",
                opcoes: ["Nitrogênio", "Oxigênio", "Argônio", "Dióxido de Carbono"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Que animal é conhecido como 'rei da selva'?",
                opcoes: ["Leão", "Tigre", "Elefante", "Rinoceronte"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },
            {
                pergunta: "Qual é o maior mamífero do mundo?",
                opcoes: ["Baleia-azul", "Elefante-africano", "Girafa", "Hipopótamo"],
                respostaCorreta: 0,
                categoria: "🔬 Ciência"
            },

            // 🎬 ENTRETENIMENTO (10 perguntas)
            {
                pergunta: "Quem dirigiu o filme 'Titanic'?",
                opcoes: ["James Cameron", "Steven Spielberg", "Christopher Nolan", "Quentin Tarantino"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Qual ator interpretou o Homem de Ferro no MCU?",
                opcoes: ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Mark Ruffalo"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Qual é o filme com maior bilheteria da história (2024)?",
                opcoes: ["Avatar", "Vingadores: Ultimato", "Titanic", "Star Wars: O Despertar da Força"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Quantos filmes tem a saga 'Harry Potter'?",
                opcoes: ["8", "7", "9", "6"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Qual destes não é um personagem da Disney?",
                opcoes: ["Shrek", "Mickey Mouse", "Pato Donald", "Pluto"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Em que ano foi lançado o primeiro iPhone?",
                opcoes: ["2007", "2005", "2008", "2006"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Qual é o jogo mais vendido da história?",
                opcoes: ["Minecraft", "Tetris", "GTA V", "Wii Sports"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Quantas temporadas tem 'Game of Thrones'?",
                opcoes: ["8", "7", "9", "6"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Qual cantora é conhecida como 'Rainha do Pop'?",
                opcoes: ["Madonna", "Beyoncé", "Lady Gaga", "Rihanna"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },
            {
                pergunta: "Qual destes é um streaming de vídeo?",
                opcoes: ["Netflix", "Facebook", "Twitter", "Instagram"],
                respostaCorreta: 0,
                categoria: "🎬 Entretenimento"
            },

            // ⚽ ESPORTES (10 perguntas)
            {
                pergunta: "Quantos jogadores tem um time de futebol em campo?",
                opcoes: ["11", "10", "12", "9"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Quantas medalhas de ouro Michael Phelps tem em Olimpíadas?",
                opcoes: ["23", "28", "25", "19"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Qual país venceu a Copa do Mundo de 2022?",
                opcoes: ["Argentina", "França", "Brasil", "Alemanha"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Quantos pontos vale uma cesta de 3 pontos no basquete?",
                opcoes: ["3", "2", "1", "4"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Em que esporte se usa uma raquete e uma peteca?",
                opcoes: ["Badminton", "Tênis", "Tênis de mesa", "Squash"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Quantos sets tem uma partida de tênis masculino em Grand Slam?",
                opcoes: ["5", "3", "4", "6"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Qual destes NÃO é um estilo de natação?",
                opcoes: ["Borboleta dupla", "Borboleta", "Costas", "Livre"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Quantos jogadores tem um time de vôlei em quadra?",
                opcoes: ["6", "5", "7", "8"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Qual atleta é conhecido como 'Usain Bolt'?",
                opcoes: ["Velocista", "Nadador", "Saltador", "Lançador"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },
            {
                pergunta: "Em que ano o Brasil sediou a Copa do Mundo?",
                opcoes: ["2014", "2010", "2018", "2006"],
                respostaCorreta: 0,
                categoria: "⚽ Esportes"
            },

            // 🌍 CONHECIMENTOS GERAIS (10 perguntas)
            {
                pergunta: "Quantos ossos tem o corpo humano adulto?",
                opcoes: ["206", "195", "215", "180"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Qual é o animal mais rápido do mundo?",
                opcoes: ["Falcão-peregrino", "Guepardo", "Antílope", "Águia"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Em que ano o homem pisou na Lua pela primeira vez?",
                opcoes: ["1969", "1957", "1975", "1965"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Qual é a montanha mais alta do mundo?",
                opcoes: ["Monte Everest", "K2", "Mont Blanc", "Monte Fuji"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Quantas cores tem o arco-íris?",
                opcoes: ["7", "6", "8", "5"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Qual é o livro mais vendido do mundo?",
                opcoes: ["Bíblia", "Dom Quixote", "Um Conto de Duas Cidades", "O Pequeno Príncipe"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Quantas horas tem um dia?",
                opcoes: ["24", "12", "36", "48"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Qual é o metal mais caro do mundo?",
                opcoes: ["Ródio", "Ouro", "Platina", "Prata"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Quantas semanas tem um ano?",
                opcoes: ["52", "48", "50", "54"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            },
            {
                pergunta: "Qual é o país mais populoso do mundo (2024)?",
                opcoes: ["Índia", "China", "Estados Unidos", "Indonésia"],
                respostaCorreta: 0,
                categoria: "🌍 Conhecimentos Gerais"
            }
        ];
    }

    static embaralharArray(array) {
        const novoArray = [...array];
        for (let i = novoArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
        }
        return novoArray;
    }
}

// TIMER DAS PERGUNTAS
function iniciarTimer() {
    estadoQuiz.tempoRestante = 15;
    estadoQuiz.respostaSelecionada = false;
    
    if (elementos.contadorTempoElemento) {
        elementos.contadorTempoElemento.textContent = `${estadoQuiz.tempoRestante}s`;
    }
    
    if (elementos.tempoRestanteElemento) {
        elementos.tempoRestanteElemento.style.width = '100%';
        elementos.tempoRestanteElemento.classList.remove('urgente');
    }
    
    if (estadoQuiz.timer) {
        clearInterval(estadoQuiz.timer);
    }
    
    estadoQuiz.timer = setInterval(() => {
        if (estadoQuiz.respostaSelecionada) return;
        
        estadoQuiz.tempoRestante--;
        
        if (elementos.contadorTempoElemento) {
            elementos.contadorTempoElemento.textContent = `${estadoQuiz.tempoRestante}s`;
        }
        
        if (elementos.tempoRestanteElemento) {
            const porcentagem = (estadoQuiz.tempoRestante / 15) * 100;
            elementos.tempoRestanteElemento.style.width = `${porcentagem}%`;
            
            if (estadoQuiz.tempoRestante <= 5) {
                elementos.tempoRestanteElemento.classList.add('urgente');
            }
        }
        
        if (estadoQuiz.tempoRestante <= 0) {
            clearInterval(estadoQuiz.timer);
            tempoEsgotado();
        }
    }, 1000);
}

function tempoEsgotado() {
    estadoQuiz.respostaSelecionada = true;
    
    const pergunta = estadoQuiz.perguntas[estadoQuiz.perguntaAtual];
    const botoes = elementos.opcoesElemento.querySelectorAll('.opcao-btn');
    
    botoes[pergunta.respostaCorreta].classList.add('correta');
    botoes.forEach(botao => botao.disabled = true);
    
    setTimeout(proximaPergunta, 2000);
}

// ATUALIZE A FUNÇÃO INICIARQUIZ
async function iniciarQuiz() {
    console.log("🎯 Iniciando missão IA...");
    
    try {
        tempoInicioQuiz = Date.now(); // Registrar início do quiz
        elementos.btnIniciar.disabled = true;
        elementos.btnIniciar.textContent = "CONECTANDO...";
        mostrarTela('loading');
        
        // Simular conexão com IA
        if (elementos.statusGeracao) {
            elementos.statusGeracao.textContent = "Conectando com servidor IA...";
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            elementos.statusGeracao.textContent = "Sincronizando banco de dados...";
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            elementos.statusGeracao.textContent = "Gerando perguntas únicas...";
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout na conexão com IA")), 10000)
        );
        
        const gerarPerguntas = GeradorPerguntasIA.gerarPerguntasUnicas(8);
        estadoQuiz.perguntas = await Promise.race([gerarPerguntas, timeout]);
        
        if (!estadoQuiz.perguntas || estadoQuiz.perguntas.length === 0) {
            throw new Error("Falha na geração de perguntas");
        }
        
        console.log("✅ Perguntas geradas com sucesso!");
        
        estadoQuiz.perguntaAtual = 0;
        estadoQuiz.pontuacao = 0;
        mostrarTela('quiz');
        mostrarPergunta();
        
    } catch (error) {
        console.error("💥 Erro:", error);
        mostrarTela('inicial');
        elementos.btnIniciar.disabled = false;
        elementos.btnIniciar.textContent = "TENTAR NOVAMENTE";
        alert("🚨 Falha na conexão com IA! Verifique sua conexão e tente novamente.");
    }
}

// MOSTRAR PERGUNTA
function mostrarPergunta() {
    const pergunta = estadoQuiz.perguntas[estadoQuiz.perguntaAtual];
    
    elementos.perguntaElemento.textContent = pergunta.pergunta;
    elementos.categoriaElemento.textContent = pergunta.categoria;
    elementos.contadorElemento.textContent = `${estadoQuiz.perguntaAtual + 1}/${estadoQuiz.perguntas.length}`;
    
    elementos.opcoesElemento.innerHTML = '';
    pergunta.opcoes.forEach((opcao, index) => {
        const botao = document.createElement('button');
        botao.className = 'opcao-btn';
        botao.textContent = opcao;
        botao.onclick = () => selecionarResposta(index);
        elementos.opcoesElemento.appendChild(botao);
    });
    
    iniciarTimer();
}

// SELECIONAR RESPOSTA
function selecionarResposta(indice) {
    if (estadoQuiz.respostaSelecionada) return;
    
    estadoQuiz.respostaSelecionada = true;
    clearInterval(estadoQuiz.timer);
    
    const pergunta = estadoQuiz.perguntas[estadoQuiz.perguntaAtual];
    const botoes = elementos.opcoesElemento.querySelectorAll('.opcao-btn');
    
    botoes.forEach(botao => botao.disabled = true);
    
    if (indice === pergunta.respostaCorreta) {
        botoes[indice].classList.add('correta');
        estadoQuiz.pontuacao++;
    } else {
        botoes[indice].classList.add('incorreta');
        botoes[pergunta.respostaCorreta].classList.add('correta');
    }
    
    setTimeout(proximaPergunta, 1500);
}

function proximaPergunta() {
    elementos.telaQuiz.classList.add('transicao');
    
    setTimeout(() => {
        elementos.telaQuiz.classList.remove('transicao');
        
        estadoQuiz.perguntaAtual++;
        
        if (estadoQuiz.perguntaAtual < estadoQuiz.perguntas.length) {
            mostrarPergunta();
        } else {
            finalizarQuiz();
        }
    }, 500);
}

// SUBSTITUA A FUNÇÃO finalizarQuiz POR ESTA:
function finalizarQuiz() {
    const totalPerguntas = estadoQuiz.perguntas.length;
    const corretas = estadoQuiz.pontuacao;
    const erradas = totalPerguntas - corretas;
    const percentual = Math.round((corretas / totalPerguntas) * 100);
    
    // Calcular tempo médio
    const tempoTotal = Date.now() - tempoInicioQuiz;
    const tempoMedioPorQuestao = Math.round((tempoTotal / totalPerguntas) / 1000);
    
    // Atualizar elementos do resultado
    elementos.pontuacaoFinal.textContent = `${corretas}/${totalPerguntas}`;
    elementos.questoesErradas.textContent = erradas;
    elementos.porcentagemFinal.textContent = `${percentual}%`;
    elementos.corretasCount.textContent = corretas;
    elementos.erradasCount.textContent = erradas;
    elementos.tempoMedio.textContent = `${tempoMedioPorQuestao}s`;
    
    // Definir mensagem motivacional e ícone baseado no desempenho
    let mensagem = "";
    let icone = "";
    
    if (percentual === 100) {
        mensagem = "🏆 PERFEITO! Domínio total do conhecimento galáctico! Você é uma lenda interstelar!";
        icone = "👑";
    } else if (percentual >= 90) {
        mensagem = "⭐ EXCELENTE! Quase uma lenda espacial! Seu conhecimento brilha como as estrelas!";
        icone = "🌟";
    } else if (percentual >= 80) {
        mensagem = "🚀 INCRÍVEL! Você navega pelo conhecimento com maestria! Continue assim!";
        icone = "🚀";
    } else if (percentual >= 70) {
        mensagem = "💫 MUITO BOM! Sua jornada espacial está no caminho certo!";
        icone = "💫";
    } else if (percentual >= 60) {
        mensagem = "🛰️ BOM TRABALHO! Continue explorando a galáxia do conhecimento!";
        icone = "🛰️";
    } else if (percentual >= 50) {
        mensagem = "🌍 BOA TENTATIVA! Cada missão te torna mais sábio!";
        icone = "🌍";
    } else {
        mensagem = "🌌 NÃO DESISTA! Até os maiores exploradores começaram sua jornada!";
        icone = "🌌";
    }
    
    elementos.mensagemMotivacional.textContent = mensagem;
    elementos.iconeResultado.textContent = icone;
    
    // Mostrar tela de resultado
    mostrarTela('resultado');
    
    // Animar barra de desempenho após um pequeno delay
    setTimeout(() => {
        elementos.barraDesempenho.style.width = `${percentual}%`;
    }, 500);
}

// ADICIONE ESTE EVENT LISTENER NO final do DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("🛸 Quiz Galáctico IA pronto!");
    criarElementosEspaciais();
    
    if (!elementos.btnIniciar) {
        console.error("❌ Elementos DOM não encontrados!");
        return;
    }
    
    elementos.btnIniciar.addEventListener('click', iniciarQuiz);
    elementos.btnNovaMissao.addEventListener('click', () => {
        mostrarTela('inicial');
    });
    
    // Configurar estado inicial
    mostrarTela('inicial');
});