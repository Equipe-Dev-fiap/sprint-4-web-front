import { useEffect, useState } from "react";
import WeatherCard from "../components/Weathercard";

import slideImage1 from "../assets/imagem-passabola-1.jpg";
import slideImage2 from "../assets/imagem-passabola-2.jpg";
import slideImage3 from "../assets/imagem-passabola-3.jpg";

// Componente para um visual mais sóbrio e profissional
export default function Home() {
  const [slideAtual, setSlideAtual] = useState(0);
  // NOVO ESTADO: Controla a visibilidade do WeatherCard
  const [mostrarClima, setMostrarClima] = useState(false);

  const slides = [
    { icone: "", texto: "Inspire-se no futebol feminino!", imagem: slideImage1 },
    { icone: "", texto: "Monte seu time e entre em campo!", imagem: slideImage2 },
    { icone: "", texto: "Mostre seu talento nos campeonatos!", imagem: slideImage3 },
  ];

  useEffect(() => {
    document.title = "Passa a Bola – Futebol Feminino";
    const intervalo = setInterval(
      () => setSlideAtual((i) => (i + 1) % slides.length),
      4500
    );
    return () => clearInterval(intervalo);
  }, [slides.length]);

  // Função para alternar a visibilidade do clima
  const toggleClima = () => {
    setMostrarClima(prev => !prev);
  };

  return (
    // Estrutura principal
    <div className="relative flex flex-col items-center text-center px-4 md:px-12 py-24 min-h-screen bg-gray-950 bg-gradient-to-b from-gray-900 to-gray-950">
      
      {/* 🌤️ MODAL/SIDEBAR DO CLIMA (Posição fixa para aparecer sobre tudo) */}
      {mostrarClima && (
        <div 
          className="fixed top-0 left-0 w-full h-full flex justify-end items-start z-50 p-4 md:p-8"
          // Clicar fora do card fecha (para o mobile/usabilidade)
          onClick={toggleClima}
        >
          <div 
            className="p-4 bg-gray-800/90 backdrop-blur-md rounded-lg border border-pink-700/50 shadow-2xl shadow-black/80 transform transition-all duration-300 ease-in-out hover:scale-[1.02]"
            // Impede que o clique no card feche o modal
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de fechar dentro do card */}
            <button 
              onClick={toggleClima} 
              className="absolute top-2 right-2 text-gray-400 hover:text-pink-400 text-lg transition-colors"
            >
              &times;
            </button>
            <WeatherCard />
          </div>
        </div>
      )}
      
      {/* ⚽ SEÇÃO PRINCIPAL (TÍTULO, DESCRIÇÃO E BOTÕES CENTRALIZADOS) */}
      <div className="max-w-6xl w-full mb-24">
        
        {/* HEADLINE */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-fuchsia-400 drop-shadow-sm tracking-tighter">
          Viva a paixão pelo <span className="text-white">Futebol Feminino</span>
        </h1>

        {/* DESCRIÇÃO */}
        <p className="text-gray-300 max-w-4xl mx-auto mb-10 text-xl md:text-2xl leading-relaxed font-normal">
          O <strong className="text-pink-300 font-semibold">Passa a Bola</strong> conecta atletas, equipes e torneios em uma única plataforma.
          <br/>Inscreva-se, monte seu time e mostre seu talento nos gramados!
        </p>

        {/* CONTAINER DOS BOTÕES: Centralizado e com espaçamento entre eles */}
        <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4">
          
          {/* BOTÃO PRINCIPAL (CTA - Alto Contraste) */}
          <a
            href="/Campeonatos"
            className="inline-block px-12 py-5 text-xl uppercase tracking-widest font-bold rounded-lg
            text-white
            bg-gradient-to-r from-pink-600 to-fuchsia-600 
            hover:from-pink-500 hover:to-fuchsia-500
            shadow-2xl shadow-pink-700/60 
            transition-all duration-300 ease-in-out hover:scale-[1.05]"
          >
            Inscreva-se Agora ⚽
          </a>

          {/* NOVO BOTÃO SECUNDÁRIO (Clima) - Estilo sutil para não competir */}
          <button
            onClick={toggleClima}
            className="px-8 py-5 text-lg uppercase tracking-wide font-semibold rounded-lg
            text-gray-300 
            bg-gray-700/50 
            border border-gray-600
            hover:bg-gray-700 hover:text-white hover:border-pink-500/50
            transition-all duration-200 ease-in-out hover:shadow-lg hover:shadow-black/50"
          >
            ☀️ Veja o Clima da Cidade que você vai jogar
          </button>
        </div>
      </div>


      {/* SLIDESHOW */}
      <div className="relative w-full max-w-6xl h-96 md:h-[500px] overflow-hidden rounded-xl shadow-2xl shadow-black/80 mb-20 border border-gray-800">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
              index === slideAtual ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <div
              style={{ backgroundImage: `url(${slide.imagem})` }}
              className="absolute inset-0 bg-cover bg-center"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
            </div>
            <h3 className="relative z-10 text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl leading-snug max-w-4xl px-4">
              {slide.texto}
            </h3>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
                <div 
                    key={index} 
                    className={`h-2 rounded-full transition-all duration-300 ${
                        index === slideAtual ? "w-8 bg-pink-500" : "w-2 bg-gray-500/50 hover:bg-gray-400/80 cursor-pointer"
                    }`}
                    onClick={() => setSlideAtual(index)}
                ></div>
            ))}
        </div>
      </div>

      {/* FEATURE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-0 py-24 mt-8 w-full max-w-6xl">
        
        <div className="p-8 bg-gray-800/80 rounded-xl border border-gray-700 hover:border-pink-600/50 shadow-xl shadow-black/50 hover:shadow-pink-600/20 hover:-translate-y-1 transition-all duration-300">
          <div className="text-4xl mb-4 text-pink-500">🏆</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Campeonatos Regionais</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Participe de torneios locais e ganhe visibilidade como jogadora.
          </p>
        </div>

        <div className="p-8 bg-gray-800/80 rounded-xl border border-gray-700 hover:border-fuchsia-600/50 shadow-xl shadow-black/50 hover:shadow-fuchsia-600/20 hover:-translate-y-1 transition-all duration-300">
          <div className="text-4xl mb-4 text-fuchsia-500">👟</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Monte seu Time</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Crie ou entre em uma equipe, treine e evolua sua performance.
          </p>
        </div>

        <div className="p-8 bg-gray-800/80 rounded-xl border border-gray-700 hover:border-indigo-600/50 shadow-xl shadow-black/50 hover:shadow-indigo-600/20 hover:-translate-y-1 transition-all duration-300">
          <div className="text-4xl mb-4 text-indigo-500">📊</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Estatísticas e Rankings</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Acompanhe resultados, evolução e desempenho em tempo real.
          </p>
        </div>

      </section>
    </div>
  );
}