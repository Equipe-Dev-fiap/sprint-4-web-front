import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5001";
const POSICOES = ["Goleira", "Defesa", "Meio-campo", "Ataque"];

export default function Campeonatos() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" ou "player"
  const email = (localStorage.getItem("email") || "").toLowerCase();
  const isAdmin = role === "admin";

  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [lista, setLista] = useState([]);
  const [campNome, setCampNome] = useState("");
  const [campIdadeMin, setCampIdadeMin] = useState("");
  const [campIdadeMax, setCampIdadeMax] = useState("");
  const [campSel, setCampSel] = useState(null);
  const [timeSel, setTimeSel] = useState(null);

  const [timeCriando, setTimeCriando] = useState(false);

  // Jogadora para adicionar no time selecionado (dono/admin)
  const [jog, setJog] = useState({ nome: "", posicao: "Goleira", numero: "" });

  // Inscrição sozinha (random) — AGORA com idade
  const [solo, setSolo] = useState({ nome: "", posicao: "Goleira", numero: "", idade: "" });

  // Modais simples (apenas exclusão com confirmação, edição para admin)
  const [modal, setModal] = useState({ open: false, tipo: null, payload: null, titulo: "", msg: "" });
  const [modalEditCamp, setModalEditCamp] = useState({ open: false, camp: null, nome: "", idadeMin: "", idadeMax: "" });
  const [modalEditTime, setModalEditTime] = useState({ open: false, time: null, nome: "" });
  const [modalEditJog, setModalEditJog] = useState({ open: false, jog: null, nome: "", posicao: "Goleira", numero: "" });
    
  // Novo estado para controlar a visibilidade do formulário de inscrição solo
  const [modalInscricaoSolo, setModalInscricaoSolo] = useState(false);

  const carregar = async () => {
    const { data } = await axios.get(`${API}/campeonatos`);
    setLista(data);
    // valida seleção
    if (campSel && !data.find((c) => c.id === campSel)) { setCampSel(null); setTimeSel(null); }
    if (campSel && timeSel) {
      const c = data.find((c) => c.id === campSel);
      if (!c || !c.times.find((t) => t.id === timeSel)) setTimeSel(null);
    }
  };

  useEffect(() => { carregar(); }, []);

  const campeonatoAtual = lista.find((c) => c.id === campSel) || null;
  const timeAtual = campeonatoAtual?.times.find((t) => t.id === timeSel) || null;

  // ===== Campeonatos =====
  const criarCampeonato = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Apenas admin cria campeonatos");
    if (!campNome.trim()) return;

    const min = parseInt(campIdadeMin, 10);
    const max = parseInt(campIdadeMax, 10);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max) {
      alert("Faixa etária inválida. Use números inteiros positivos (mínimo <= máximo).");
      return;
    }

    await axios.post(`${API}/campeonatos`, { nome: campNome.trim(), idadeMin: min, idadeMax: max }, auth);
    setCampNome("");
    setCampIdadeMin("");
    setCampIdadeMax("");
    carregar();
  };

  const abrirEditarCampeonato = (camp) => {
    if (!isAdmin) return;
    setModalEditCamp({ open: true, camp, nome: camp.nome, idadeMin: String(camp.idadeMin || ""), idadeMax: String(camp.idadeMax || "") });
  };
  const salvarEdicaoCampeonato = async () => {
    const body = { nome: modalEditCamp.nome };
    const min = parseInt(modalEditCamp.idadeMin, 10);
    const max = parseInt(modalEditCamp.idadeMax, 10);
    if (modalEditCamp.idadeMin !== "" && modalEditCamp.idadeMax !== "") {
      if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max) {
        alert("Faixa etária inválida. Use inteiros positivos (mínimo <= máximo).");
        return;
      }
      body.idadeMin = min;
      body.idadeMax = max;
    }
    await axios.put(`${API}/campeonatos/${modalEditCamp.camp.id}`, body, auth);
    setModalEditCamp({ open: false, camp: null, nome: "", idadeMin: "", idadeMax: "" });
    carregar();
  };
  const abrirExcluirCampeonato = (camp) => {
    if (!isAdmin) return;
    setModal({ open: true, tipo: "del-camp", payload: { campId: camp.id }, titulo: "Excluir Campeonato", msg: `Excluir "${camp.nome}"? Essa ação é irreversível.` });
  };
  const excluirCampeonato = async (campId) => {
    await axios.delete(`${API}/campeonatos/${campId}`, auth);
    setModal({ open: false, tipo: null, payload: null, titulo: "", msg: "" });
    if (campSel === campId) { setCampSel(null); setTimeSel(null); }
    carregar();
  };

  // ===== Times =====
  // Criar time — AGORA: APENAS ADMIN
  const criarTime = async () => {
    if (!isAdmin) return alert("Apenas o administrador pode criar times");
    if (!campSel) return alert("Selecione um campeonato");
    try {
      setTimeCriando(true);
      await axios.post(`${API}/campeonatos/${campSel}/times`, {}, auth);
      carregar();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao criar time");
    } finally {
      setTimeCriando(false);
    }
  };
  const abrirEditarTime = (time) => {
    if (!isAdmin) return;
    setModalEditTime({ open: true, time, nome: time.nome });
  };
  const salvarEdicaoTime = async () => {
    await axios.put(`${API}/campeonatos/${campSel}/times/${modalEditTime.time.id}`, { nome: modalEditTime.nome }, auth);
    setModalEditTime({ open: false, time: null, nome: "" });
    carregar();
  };
  const abrirExcluirTime = (time) => {
    if (!isAdmin) return;
    setModal({ open: true, tipo: "del-time", payload: { timeId: time.id }, titulo: "Excluir Time", msg: `Excluir o time "${time.nome}"?` });
  };
  const excluirTime = async (timeId) => {
    await axios.delete(`${API}/campeonatos/${campSel}/times/${timeId}`, auth);
    setModal({ open: false, tipo: null, payload: null, titulo: "", msg: "" });
    if (timeSel === timeId) setTimeSel(null);
    carregar();
  };

  // ===== Jogadoras (dono ou admin) =====
  const adicionarJogadora = async (e) => {
    e.preventDefault();
    if (!campSel || !timeSel) return alert("Selecione campeonato e time");
    if (!jog.nome.trim() || !jog.numero) return;

    const num = Number(jog.numero);
    if (!Number.isInteger(num) || num <= 0) {
        alert("Número da camisa deve ser um inteiro positivo.");
        return;
    }

    // INÍCIO DA CORREÇÃO: Verifica a duplicidade APENAS no time selecionado (frontend)
    if (timeAtual) {
        const camisaDuplicada = timeAtual.jogadoras.some(
            // timeAtual.jogadoras JÁ É A LISTA CORRETA DE JOGADORAS DO TIME SELECIONADO
            (j) => j.numero === num
        );

        if (camisaDuplicada) {
            alert(`ERRO: A camisa ${num} já está em uso no time ${timeAtual.nome}.`);
            return; // Impede o envio para o backend
        }
    }
    // FIM DA CORREÇÃO

    try {
      await axios.post(`${API}/campeonatos/${campSel}/times/${timeSel}/jogadoras`, {
        nome: jog.nome.trim(), posicao: jog.posicao, numero: num
      }, auth);
      setJog({ nome: "", posicao: "Goleira", numero: "" });
      carregar();
    } catch (err) {
      // Se a verificação do frontend falhar (estado desatualizado) ou se a validação do backend 
      // estiver errada (verificando globalmente), o erro do servidor aparece aqui.
      alert(err.response?.data?.message || "Erro ao adicionar jogadora");
    }
  };

  const abrirEditarJogadora = (j) => {
    if (!isAdmin) return;
    setModalEditJog({ open: true, jog: j, nome: j.nome, posicao: j.posicao, numero: String(j.numero) });
  };
  const salvarEdicaoJogadora = async () => {
    const j = modalEditJog.jog;
    await axios.put(`${API}/campeonatos/${campSel}/times/${timeSel}/jogadoras/${j.id}`, {
      nome: modalEditJog.nome, posicao: modalEditJog.posicao, numero: Number(modalEditJog.numero)
    }, auth);
    setModalEditJog({ open: false, jog: null, nome: "", posicao: "Goleira", numero: "" });
    carregar();
  };
  const abrirExcluirJogadora = (j) => {
    if (!isAdmin) return;
    // CORREÇÃO: Passar jogId E timeId para a exclusão
    setModal({ open: true, tipo: "del-jog", payload: { jogId: j.id, timeId: timeSel }, titulo: "Excluir Jogadora", msg: `Excluir ${j.nome}?` });
  };
  const excluirJogadora = async (jogId) => {
    // CORREÇÃO: Usar modal.payload.timeId para garantir que o time correto seja usado, como já está.
    // Apenas corrigindo o comentário para refletir que a função usa o payload.
    await axios.delete(`${API}/campeonatos/${campSel}/times/${modal.payload.timeId}/jogadoras/${jogId}`, auth);
    setModal({ open: false, tipo: null, payload: null, titulo: "", msg: "" });
    carregar();
  };

  // ===== Inscrição "sozinha" (random) — com idade
  const inscreverSozinha = async (e) => {
    e.preventDefault();
    if (!campSel) return alert("Selecione um campeonato");
    if (!solo.nome.trim() || !solo.numero || !solo.idade) return;

    const idadeNum = Number(solo.idade);
    const numeroNum = Number(solo.numero);

    if (!Number.isInteger(idadeNum) || idadeNum <= 0) {
        alert("Idade deve ser um número inteiro positivo.");
        return;
    }
    if (!Number.isInteger(numeroNum) || numeroNum <= 0) {
        alert("Número da camisa deve ser um inteiro positivo.");
        return;
    }
    
    // Validação da faixa etária no frontend
    const min = campeonatoAtual.idadeMin;
    const max = campeonatoAtual.idadeMax;
    if (min && max && (idadeNum < min || idadeNum > max)) {
        alert(`Sua idade (${idadeNum}) não está na faixa etária permitida (${min} a ${max} anos).`);
        return;
    }

    // A verificação de duplicidade de camisa para inscrição SOLO
    // DEVE SER FEITA NO BACKEND, pois é o servidor que sorteia o time. 
    // Se o seu backend estiver verificando globalmente, o erro é lá.

    try {
      const { data } = await axios.post(`${API}/campeonatos/${campSel}/inscrever-solo`, {
        nome: solo.nome.trim(), posicao: solo.posicao, numero: numeroNum, idade: idadeNum
      }, auth);
      setSolo({ nome: "", posicao: "Goleira", numero: "", idade: "" });
      setModalInscricaoSolo(false); // Fechar modal após inscrição
      alert(`Inscrita no time: ${data.timeNome}`);
      carregar();
    } catch (err) {
      // Se a camisa estiver duplicada no time que o backend SORTEOU (e o backend não verificou globalmente), a mensagem de erro virá daqui.
      alert(err.response?.data?.message || "Erro ao inscrever");
    }
  };

  return (
    <div className="px-6 py-12 text-white">
      <h2 className="text-4xl font-extrabold text-pink-400 text-center mb-8">Campeonatos</h2>

      {/* Criar campeonato (somente admin) - SEM ALTERAÇÃO */}
      {isAdmin && (
        <form onSubmit={criarCampeonato} className="max-w-3xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={campNome}
            onChange={(e) => setCampNome(e.target.value)}
            placeholder="Nome do campeonato"
            className="md:col-span-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
          />
          <input
            type="number"
            min="1"
            value={campIdadeMin}
            onChange={(e) => setCampIdadeMin(e.target.value)}
            placeholder="Idade mínima"
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
          />
          <input
            type="number"
            min="1"
            value={campIdadeMax}
            onChange={(e) => setCampIdadeMax(e.target.value)}
            placeholder="Idade máxima"
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
          />
          <div className="md:col-span-4 flex justify-end">
            <button className="bg-pink-500 hover:bg-pink-600 px-5 py-3 rounded-xl font-semibold">Criar</button>
          </div>
        </form>
      )}

      {/* Lista de campeonatos como cards - SEM ALTERAÇÃO */}
      {lista.length === 0 ? (
        <p className="text-center text-gray-400">Nenhum campeonato disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {lista.map((c) => (
            <div key={c.id} className={`p-6 rounded-2xl border shadow bg-gray-800 ${campSel === c.id ? "border-pink-500" : "border-gray-700"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{c.nome}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setCampSel(c.id); setTimeSel(null); }} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">Selecionar</button>
                  {isAdmin && (
                    <>
                      <button onClick={() => abrirEditarCampeonato(c)} className="px-3 py-1 rounded-md bg-yellow-600 hover:bg-yellow-500 text-sm">Editar</button>
                      <button onClick={() => abrirExcluirCampeonato(c)} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-sm">Excluir</button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-400 mt-1 text-sm">{c.times?.length || 0} time(s)</p>
              {typeof c.idadeMin === "number" && typeof c.idadeMax === "number" && (
                <p className="text-pink-300 mt-2 text-sm">
                  Faixa etária: <span className="font-semibold">{c.idadeMin}</span> a <span className="font-semibold">{c.idadeMax}</span> anos
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Área do campeonato selecionado */}
      {campeonatoAtual && (
        <div className="max-w-6xl mx-auto mt-12">
          <h3 className="text-2xl font-bold mb-2">
            Times de: <span className="text-pink-400">{campeonatoAtual.nome}</span>
          </h3>
          {typeof campeonatoAtual.idadeMin === "number" && typeof campeonatoAtual.idadeMax === "number" && (
            <p className="text-gray-300 mb-6">
              Faixa etária permitida: <span className="text-pink-300 font-semibold">{campeonatoAtual.idadeMin}</span> a{" "}
              <span className="text-pink-300 font-semibold">{campeonatoAtual.idadeMax}</span> anos
            </p>
          )}

          {/* Botão Inscrever-se Sozinha - SEM ALTERAÇÃO */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setModalInscricaoSolo(true)}
              className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-semibold"
            >
              Inscrever-se Sozinha
            </button>
            {/* Criar time — apenas ADMIN */}
            {isAdmin ? (
              <button
                onClick={criarTime}
                disabled={timeCriando}
                className="bg-pink-500 hover:bg-pink-600 disabled:opacity-60 px-5 py-3 rounded-xl font-semibold"
              >
                {timeCriando ? "Criando..." : "Criar Time"}
              </button>
            ) : null}
          </div>
          {isAdmin && <p className="text-gray-500 text-sm mb-6">O nome do time é automático (Time 1, Time 2...).</p>}


          {/* Lista de times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campeonatoAtual.times.map((t) => {
              const isDono = (t.dono || "") === email;
              return (
                <div key={t.id} className={`p-6 rounded-2xl border shadow bg-gray-800 ${timeSel === t.id ? "border-pink-500" : "border-gray-700"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold">{t.nome}</h4>
                      <p className="text-gray-500 text-xs">{t.jogadoras.length}/15 jogadoras</p>
                      {t.dono && <p className="text-gray-500 text-xs mt-1">Dono: {t.dono}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setTimeSel(t.id)} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">Ver Time</button>
                      {isAdmin && (
                        <>
                          <button onClick={() => abrirEditarTime(t)} className="px-3 py-1 rounded-md bg-yellow-600 hover:bg-yellow-500 text-sm">Editar</button>
                          <button onClick={() => abrirExcluirTime(t)} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-sm">Excluir</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulários e lista de jogadoras (apenas se um time estiver selecionado) */}
          {timeAtual && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
              {(isAdmin || (timeAtual.dono === email)) && (
                <form onSubmit={adicionarJogadora} className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                  <h4 className="text-pink-400 text-lg font-semibold mb-4">Adicionar jogadora ao time <span className="text-white">{timeAtual.nome}</span></h4>
                  <div className="space-y-3">
                    <input
                      value={jog.nome}
                      onChange={(e) => setJog((p) => ({ ...p, nome: e.target.value }))}
                      placeholder="Nome da jogadora"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                      required
                    />
                    <select
                      value={jog.posicao}
                      onChange={(e) => setJog((p) => ({ ...p, posicao: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                    >
                      {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input
                      type="number"
                      value={jog.numero}
                      onChange={(e) => setJog((p) => ({ ...p, numero: e.target.value }))}
                      placeholder="Número da camisa"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                      required
                      min="1"
                    />
                  </div>
                  <button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold">Adicionar</button>
                  <p className="text-gray-500 text-sm mt-2">Limite: 15 jogadoras por time.</p>
                </form>
              )}
                

              {/* Lista de jogadoras - Ocupa todo o espaço se for o único, ou a outra coluna */}
              <div className={`${(isAdmin || (timeAtual.dono === email)) ? "" : "lg:col-span-2"}`}>
                <h4 className="text-white text-lg font-semibold mb-4">
                  Jogadoras de <span className="text-pink-400">{timeAtual.nome}</span>
                </h4>
                {timeAtual.jogadoras.length === 0 ? (
                  <p className="text-gray-400">Nenhuma jogadora cadastrada.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {timeAtual.jogadoras.map((j) => (
                      <div key={j.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-white font-semibold">
                              {j.nome} <span className="text-gray-400">#{j.numero}</span>
                            </p>
                            <p className="text-gray-400 text-sm">{j.posicao}</p>
                            {typeof j.idade === "number" && (
                              <p className="text-gray-500 text-xs mt-1">Idade: {j.idade} anos</p>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex gap-2">
                              <button onClick={() => setModalEditJog({ open: true, jog: j, nome: j.nome, posicao: j.posicao, numero: String(j.numero) })} className="px-3 py-1 rounded-md bg-yellow-600 hover:bg-yellow-500 text-sm">Editar</button>
                              <button onClick={() => abrirExcluirJogadora(j)} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-sm">Excluir</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== MODAIS ===== */}
      {/* Editar Campeonato - SEM ALTERAÇÃO */}
      {modalEditCamp.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-left">
            <h4 className="text-pink-400 text-lg font-semibold mb-4">Editar Campeonato</h4>
            <div className="space-y-3 mb-4">
              <input
                value={modalEditCamp.nome}
                onChange={(e) => setModalEditCamp((m) => ({ ...m, nome: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                placeholder="Nome do campeonato"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  value={modalEditCamp.idadeMin}
                  onChange={(e) => setModalEditCamp((m) => ({ ...m, idadeMin: e.target.value }))}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                  placeholder="Idade mínima"
                />
                <input
                  type="number"
                  min="1"
                  value={modalEditCamp.idadeMax}
                  onChange={(e) => setModalEditCamp((m) => ({ ...m, idadeMax: e.target.value }))}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                  placeholder="Idade máxima"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalEditCamp({ open: false, camp: null, nome: "", idadeMin: "", idadeMax: "" })} className="px-5 py-2 rounded-xl border border-gray-600">Cancelar</button>
              <button onClick={salvarEdicaoCampeonato} className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Editar Time - SEM ALTERAÇÃO */}
      {modalEditTime.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-left">
            <h4 className="text-pink-400 text-lg font-semibold mb-4">Editar Time</h4>
            <input
              value={modalEditTime.nome}
              onChange={(e) => setModalEditTime((m) => ({ ...m, nome: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white mb-4"
              placeholder="Nome do time"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalEditTime({ open: false, time: null, nome: "" })} className="px-5 py-2 rounded-xl border border-gray-600">Cancelar</button>
              <button onClick={salvarEdicaoTime} className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}
            
      {/* Editar Jogadora - SEM ALTERAÇÃO */}
      {modalEditJog.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-left">
            <h4 className="text-pink-400 text-lg font-semibold mb-4">Editar Jogadora</h4>
            <div className="space-y-3 mb-4">
              <input
                value={modalEditJog.nome}
                onChange={(e) => setModalEditJog((m) => ({ ...m, nome: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                placeholder="Nome"
              />
              <select
                value={modalEditJog.posicao}
                onChange={(e) => setModalEditJog((m) => ({ ...m, posicao: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
              >
                {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                type="number"
                value={modalEditJog.numero}
                onChange={(e) => setModalEditJog((m) => ({ ...m, numero: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                placeholder="Número"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalEditJog({ open: false, jog: null, nome: "", posicao: "Goleira", numero: "" })} className="px-5 py-2 rounded-xl border border-gray-600">Cancelar</button>
              <button onClick={salvarEdicaoJogadora} className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}
        
      {/* Modal de Inscrição Sozinha - SEM ALTERAÇÃO NA LÓGICA DE SORTEIO */}
      {modalInscricaoSolo && campeonatoAtual && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={inscreverSozinha} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-left">
            <h4 className="text-pink-400 text-lg font-semibold mb-4">Inscrever-se sozinha (time aleatório)</h4>
            {typeof campeonatoAtual.idadeMin === "number" && typeof campeonatoAtual.idadeMax === "number" && (
              <p className="text-gray-300 mb-3">
                Faixa etária:{" "}
                <span className="text-pink-300 font-semibold">{campeonatoAtual.idadeMin}</span> a{" "}
                <span className="text-pink-300 font-semibold">{campeonatoAtual.idadeMax}</span> anos
              </p>
            )}
            <div className="space-y-3">
              <input
                value={solo.nome}
                onChange={(e) => setSolo((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Seu nome"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                required
              />
              <select
                value={solo.posicao}
                onChange={(e) => setSolo((p) => ({ ...p, posicao: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
              >
                {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                type="number"
                value={solo.numero}
                onChange={(e) => setSolo((p) => ({ ...p, numero: e.target.value }))}
                placeholder="Número da camisa"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                required
                min="1"
              />
              <input
                type="number"
                value={solo.idade}
                onChange={(e) => setSolo((p) => ({ ...p, idade: e.target.value }))}
                placeholder="Sua idade"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                required
                min="1" 
              />
            </div>
            <p className="text-gray-500 text-sm mt-4 mb-4">
              Será escolhido um time com vaga. Se não houver, um novo será criado automaticamente.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalInscricaoSolo(false)} type="button" className="px-5 py-2 rounded-xl border border-gray-600">Cancelar</button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold">Inscrever-me</button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmação de exclusão - SEM ALTERAÇÃO */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-left">
            <h4 className="text-pink-400 text-lg font-semibold mb-2">{modal.titulo}</h4>
            <p className="text-gray-300 mb-6">{modal.msg}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal({ open: false, tipo: null, payload: null, titulo: "", msg: "" })} className="px-5 py-2 rounded-xl border border-gray-600">Cancelar</button>
              <button
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white"
                onClick={() => {
                  const { tipo, payload } = modal;
                  if (tipo === "del-camp") excluirCampeonato(payload.campId);
                  if (tipo === "del-time") excluirTime(payload.timeId);
                  if (tipo === "del-jog") excluirJogadora(payload.jogId);
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}