import { useEffect, useState } from "react";
import WeatherCard from "../components/Weathercard";

import slideImage1 from "../assets/imagem-passabola-1.jpg";
import slideImage2 from "../assets/imagem-passabola-2.jpg";
import slideImage3 from "../assets/imagem-passabola-3.jpg";

export default function Home() {
  const [slideAtual, setSlideAtual] = useState(0);

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

  return (
    <div className="flex flex-col items-center text-center px-4 md:px-12 py-24 min-h-screen bg-gray-950 bg-gradient-to-b from-gray-900 to-gray-950">

      {/* SLIDES - Manter o carrossel, mas refinar o estilo para mais sobriedade */}
      <div className="relative w-full max-w-6xl h-96 md:h-[500px] overflow-hidden rounded-xl shadow-2xl shadow-black/70 mb-20 border border-gray-800">
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
              {/* Overlay mais escuro e sutil para legibilidade profissional */}
              <div className="absolute inset-0 bg-black/60 backdrop-brightness-75"></div>
            </div>
            <h2 className="relative z-10 text-4xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight">
              {slide.texto}
            </h2>
          </div>
        ))}
        {/* Adicionar indicadores de slide mais discretos */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
                <div 
                    key={index} 
                    className={`h-2 rounded-full transition-all duration-300 ${
                        index === slideAtual ? "w-8 bg-pink-500 shadow-md shadow-pink-500/50" : "w-2 bg-gray-400/50"
                    }`}
                ></div>
            ))}
        </div>
      </div>

      {/* WEATHER CARD */}
      <div className="mb-20">
        <WeatherCard />
      </div>

      {/* HEADLINE - Tipografia mais robusta e gradiente sutil */}
      <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-fuchsia-400 drop-shadow-sm tracking-tight">
        Viva a paixão pelo <span className="text-white">Futebol Feminino</span>
      </h2>

      {/* DESCRIÇÃO - Fonte mais formal e espaçamento aprimorado */}
      <p className="text-gray-300 max-w-4xl mb-12 text-xl md:text-2xl leading-normal font-light">
        O <strong className="text-pink-300 font-semibold">Passa a Bola</strong> conecta atletas, equipes e torneios em uma única plataforma.
        <br/>Inscreva-se, monte seu time e mostre seu talento nos gramados!
      </p>

      {/* BOTÃO - Mais elegante e com efeito hover profissional */}
      <a
        href="/Campeonatos"
        className="px-12 py-5 text-xl uppercase tracking-widest font-bold rounded-lg
        text-white
        bg-gradient-to-r from-pink-600 to-fuchsia-600
        hover:from-pink-700 hover:to-fuchsia-700
        shadow-xl shadow-pink-700/50 hover:shadow-fuchsia-600/60
        transition-all duration-300 ease-in-out hover:scale-[1.05] border border-transparent hover:border-white/20"
      >
        Inscreva-se Agora ⚽
      </a>

      {/* FEATURE CARDS - Design mais limpo e elegante */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-0 py-24 mt-20 w-full max-w-6xl">
        
        <div className="p-8 bg-gray-800/80 rounded-xl border-t-4 border-pink-500 shadow-2xl hover:shadow-pink-600/30 hover:-translate-y-2 transition-all duration-300">
          <div className="text-5xl mb-4 text-pink-400">🏆</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">Campeonatos Regionais</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Participe de torneios locais e ganhe visibilidade como jogadora.
          </p>
        </div>

        <div className="p-8 bg-gray-800/80 rounded-xl border-t-4 border-fuchsia-500 shadow-2xl hover:shadow-fuchsia-600/30 hover:-translate-y-2 transition-all duration-300">
          <div className="text-5xl mb-4 text-fuchsia-400">👟</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">Monte seu Time</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Crie ou entre em uma equipe, treine e evolua sua performance.
          </p>
        </div>

        <div className="p-8 bg-gray-800/80 rounded-xl border-t-4 border-indigo-500 shadow-2xl hover:shadow-indigo-600/30 hover:-translate-y-2 transition-all duration-300">
          <div className="text-5xl mb-4 text-indigo-400">📊</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">Estatísticas e Rankings</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Acompanhe resultados, evolução e desempenho em tempo real.
          </p>
        </div>

      </section>
    </div>
  );
}