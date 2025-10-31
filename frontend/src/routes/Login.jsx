import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5001";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("player");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  // ✅ ALERTA PARA O PROFESSOR
  useEffect(() => {
    alert("🔐 Acesso Administrador:\nselecionar entrar como administrador\nEmail: passabola@fiap\nSenha: 123");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (tipo === "admin" && email !== "passabola@fiap") {
      setMensagem("❌ Somente o email do administrador pode entrar como admin.");
      return;
    }

    if (tipo === "player" && email === "passabola@fiap") {
      setMensagem("❌ O administrador deve entrar no modo Administrador.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, { email, senha, tipo });
      const token = response.data.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("email", email);

        if (tipo === "admin") {
          localStorage.setItem("role", "admin");
        } else {
          localStorage.setItem("role", "player");
        }

        setMensagem("✅ Login realizado com sucesso!");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setMensagem("❌ Erro ao autenticar token");
      }
    } catch (erro) {
      console.error("Erro ao logar", erro);
      setMensagem("❌ Email ou senha incorretos.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      
      {/* Elementos decorativos (emojis) removidos para formalidade */}

      <div className="relative z-10 bg-white p-10 rounded-xl w-full max-w-md text-center shadow-2xl border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          {/* Emoji de estrela removido */}
          <h2 className="text-3xl font-bold text-gray-800 leading-tight border-b-2 border-blue-600 pb-2">
            Acesso ao <span className="text-blue-600">Sistema</span>
          </h2>
          <p className="text-gray-500 mt-2 text-base">Insira suas credenciais para continuar.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entrar como:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              <option value="player">Jogadora</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg font-semibold tracking-wide transition duration-300 shadow-md hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Acessar
          </button>
        </form>

        {mensagem && (
          <p
            className={`mt-5 text-center text-sm font-medium p-3 rounded-lg border ${
              mensagem.includes("sucesso") 
                ? "bg-green-50 border-green-300 text-green-700" 
                : "bg-red-50 border-red-300 text-red-700"
            }`}
          >
            {mensagem}
          </p>
        )}

        <p className="mt-8 text-sm text-gray-500">
          Não tem conta?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition duration-300">
            Criar Conta
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;