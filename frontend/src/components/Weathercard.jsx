import { useEffect, useState } from "react";

export default function WeatherCard() {
  const [city, setCity] = useState(import.meta.env.VITE_WEATHER_CITY || "São Paulo");
  const [weather, setWeather] = useState(null);
  const [erro, setErro] = useState(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

  async function buscarClima(cidadeEscolhida = city) {
    try {
      setErro(null);
      setWeather(null);

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidadeEscolhida}&appid=${API_KEY}&lang=pt_br&units=metric`;
      const resp = await fetch(url);

      if (!resp.ok) throw new Error("Cidade não encontrada.");
      const data = await resp.json();
      setWeather(data);
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => {
    buscarClima();
  }, []);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl px-7 py-6 shadow-lg text-center w-fit">

      {/* Campo de busca */}
      <div className="flex gap-2 justify-center mb-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-pink-400"
          placeholder="Digite uma cidade..."
        />
        <button
          onClick={() => buscarClima(city)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-white font-semibold"
        >
          Buscar
        </button>
      </div>

      {/* Mensagens */}
      {erro && <p className="text-red-400 text-sm mb-2">{erro}</p>}
      {!weather && !erro && <p className="text-gray-300 text-sm">Carregando clima...</p>}

      {/* Dados */}
      {weather && (
        <>
          <h3 className="text-lg font-bold text-pink-400 mb-1">
            {weather.name} 🌍
          </h3>

          <p className="text-4xl font-extrabold text-white drop-shadow-sm">
            {Math.round(weather.main.temp)}°C
          </p>

          <p className="text-gray-300 capitalize text-sm mt-1">
            {weather.weather[0].description}
          </p>
        </>
      )}
    </div>
  );
}
