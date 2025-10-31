import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  // HOOKS
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Função de cadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // API_URL definida diretamente para manter a consistência com o Login
      const response = await axios.post("http://localhost:5001/register", {
        email,
        senha,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (erro) {
      setMessage(erro.response?.data?.message || "Erro ao registrar usuário");
    }
  };

  return (
    // Fundo neutro e formal
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      
      {/* Ícones decorativos de fundo removidos para formalidade */}

      {/* Card de registro (Estilo formal e limpo) */}
      <div className="relative z-10 bg-white p-10 rounded-xl w-full max-w-md text-center shadow-2xl border border-gray-200">
        
        {/* Título (Estilo consistente com o Login formal) */}
        <div className="flex flex-col items-center mb-8">
          {/* Ícone removido */}
          <h2 className="text-3xl font-bold text-gray-800 leading-tight border-b-2 border-blue-600 pb-2">
            Criar <span className="text-blue-600">Conta</span>
          </h2>
          <p className="text-gray-500 mt-2 text-base max-w-xs">
            Registre-se para acessar todas as funcionalidades do sistema.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleRegister} className="space-y-6 text-left">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              // Estilo de input formal
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Crie uma senha segura"
              // Estilo de input formal
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition duration-300"
              required
            />
          </div>

          <button
            type="submit"
            // Estilo do botão formal (cor sólida e profissional)
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg font-semibold tracking-wide transition duration-300 shadow-md hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Confirmar Cadastro
          </button>
        </form>

        {/* Mensagem */}
        {message && (
          <p
            className={`mt-6 text-center text-sm font-medium p-3 rounded-lg border ${
              message.toLowerCase().includes("sucesso")
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-red-50 border-red-300 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        {/* Link para login */}
        <p className="mt-8 text-sm text-gray-500">
          Já tem uma conta?{" "}
          <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition duration-300">
            Fazer Login.
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
