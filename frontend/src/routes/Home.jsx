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
    <div className="flex flex-col items-center text-center px-4 md:px-8 py-20 min-h-screen bg-gray-950 bg-gradient-to-b from-gray-900 to-black">

      {/* SLIDES */}
      <div className="relative w-full max-w-6xl h-80 md:h-[450px] overflow-hidden rounded-3xl shadow-2xl mb-16 border border-gray-700/30">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)] ${
              index === slideAtual ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <div
              style={{ backgroundImage: `url(${slide.imagem})` }}
              className="absolute inset-0 bg-cover bg-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
            </div>
            <h2 className="relative z-10 text-4xl md:text-6xl font-extrabold text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
              {slide.texto}
            </h2>
          </div>
        ))}
      </div>

      {/* WEATHER CARD */}
      <div className="mb-14">
        <WeatherCard />
      </div>

      {/* HEADLINE */}
      <h2 className="text-4xl md:text-6xl font-black mb-5 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-fuchsia-500 drop-shadow-lg">
        Viva a paixão pelo <span className="text-white">Futebol Feminino</span>
      </h2>

      <p className="text-gray-300 max-w-3xl mb-10 text-lg md:text-xl leading-relaxed font-light">
        O <strong className="text-pink-300 font-semibold">Passa a Bola</strong> conecta atletas, equipes e torneios em uma única plataforma.
        Inscreva-se, monte seu time e mostre seu talento nos gramados!
      </p>

      <a
        href="/Campeonatos"
        className="px-10 py-4 text-lg uppercase tracking-wide font-semibold rounded-full 
        bg-gradient-to-r from-pink-600 to-fuchsia-600 
        hover:from-pink-500 hover:to-fuchsia-500 
        shadow-lg shadow-pink-700/40 hover:shadow-pink-600/50
        transition-all duration-300 ease-out hover:scale-[1.07]"
      >
        Inscreva-se Agora ⚽
      </a>

      {/* FEATURE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-12 py-16 mt-20 w-full max-w-6xl">
        
        <div className="p-8 bg-gray-850/60 backdrop-blur-lg rounded-2xl border border-gray-700/40 shadow-xl hover:shadow-pink-600/25 hover:-translate-y-1 transition-all">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-pink-400 mb-3">Campeonatos Regionais</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Participe de torneios locais e ganhe visibilidade como jogadora.
          </p>
        </div>

        <div className="p-8 bg-gray-850/60 backdrop-blur-lg rounded-2xl border border-gray-700/40 shadow-xl hover:shadow-indigo-400/25 hover:-translate-y-1 transition-all">
          <div className="text-6xl mb-4">👟</div>
          <h3 className="text-2xl font-bold text-pink-400 mb-3">Monte seu Time</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Crie ou entre em uma equipe, treine e evolua sua performance.
          </p>
        </div>

        <div className="p-8 bg-gray-850/60 backdrop-blur-lg rounded-2xl border border-gray-700/40 shadow-xl hover:shadow-fuchsia-500/25 hover:-translate-y-1 transition-all">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-pink-400 mb-3">Estatísticas e Rankings</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Acompanhe resultados, evolução e desempenho em tempo real.
          </p>
        </div>

      </section>
    </div>
  );
}
