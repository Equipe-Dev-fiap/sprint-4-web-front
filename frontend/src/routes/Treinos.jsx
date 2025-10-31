import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5001";

export default function Treinos() {
  const [treinos, setTreinos] = useState([]);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [form, setForm] = useState({ id: null, nome: "", descricao: "", exercicios: "" });

  const token = localStorage.getItem("token");
  const isAdmin = !!token;

  const carregar = async () => {
    const { data } = await axios.get(`${API}/treinos`);
    setTreinos(data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const salvar = async (e) => {
    e.preventDefault();
    const headers = isAdmin ? { Authorization: `Bearer ${token}` } : {};
    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      exercicios: form.exercicios
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (form.id) {
      await axios.put(`${API}/treinos/${form.id}`, payload, { headers });
    } else {
      await axios.post(`${API}/treinos`, payload, { headers });
    }
    setForm({ id: null, nome: "", descricao: "", exercicios: "" });
    carregar();
  };

  const editar = (t) => {
    setForm({
      id: t.id,
      nome: t.nome,
      descricao: t.descricao || "",
      exercicios: (t.exercicios || []).join(", "),
    });
  };

  const excluir = async (id) => {
    const headers = isAdmin ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`${API}/treinos/${id}`, { headers });
    if (treinoSelecionado?.id === id) setTreinoSelecionado(null);
    carregar();
  };

  return (
    <div className="flex flex-col items-center py-16 text-center px-6 pb-20">
      {/* Título principal */}
      <h2 className="text-5xl font-extrabold mb-4 text-indigo-400 tracking-tight">Nossos Treinos</h2>
      <p className="text-gray-300 max-w-2xl mb-12 text-lg">
        Desenvolva força, resistência e bem-estar com treinos inteligentes,
        personalizados e acompanhados por tecnologia de ponta.
      </p>

      {/* Grid de treinos (dinâmico) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
        {treinos.map((t) => (
          <div
            key={t.id}
            className="p-8 rounded-2xl border border-gray-700 bg-gray-800 shadow-lg transform transition hover:scale-105 hover:border-indigo-500"
          >
            <h3 className="text-2xl font-semibold mb-2 text-indigo-400">{t.nome}</h3>
            <p className="text-gray-400 mb-6">{t.descricao}</p>

            <button
              onClick={() => setTreinoSelecionado(t)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
            >
              Clique aqui
            </button>

            {isAdmin && (
              <div className="flex justify-between mt-4 text-sm">
                <button onClick={() => editar(t)} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600">
                  Editar
                </button>
                <button onClick={() => excluir(t.id)} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500">
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exibição dos exercícios */}
      {treinoSelecionado && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl mt-16 p-8 w-full max-w-3xl shadow-xl">
          <h3 className="text-3xl font-bold text-indigo-400 mb-4">{treinoSelecionado.nome}</h3>
          <p className="text-gray-300 mb-6">{treinoSelecionado.descricao}</p>
          <h4 className="text-lg font-semibold text-indigo-300 mb-3">Exercícios:</h4>
          <ul className="text-gray-400 text-left list-disc list-inside space-y-2">
            {(treinoSelecionado.exercicios || []).map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ul>
          <button
            onClick={() => setTreinoSelecionado(null)}
            className="mt-8 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Formulário (só quando logado) */}
      {isAdmin && (
        <form onSubmit={salvar} className="mt-12 bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-xl text-left">
          <h3 className="text-indigo-400 text-xl font-semibold mb-4">{form.id ? "Editar treino" : "Adicionar novo treino"}</h3>
          <div className="space-y-3">
            <input
              name="nome"
              value={form.nome}
              onChange={onChange}
              placeholder="Nome"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
            <input
              name="descricao"
              value={form.descricao}
              onChange={onChange}
              placeholder="Descrição"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
            <textarea
              name="exercicios"
              value={form.exercicios}
              onChange={onChange}
              placeholder="Exercícios (separe por vírgula)"
              rows="3"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition">
              {form.id ? "Salvar alterações" : "Criar treino"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ id: null, nome: "", descricao: "", exercicios: "" })}
                className="px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-800"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
