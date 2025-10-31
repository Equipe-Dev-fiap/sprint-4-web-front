export default function Contato() {
  return (
<div className="flex flex-col items-center justify-center py-16 text-center px-6">
<h2 className="text-4xl font-bold mb-6 text-indigo-400">Entre em Contato</h2>
<p className="text-gray-300 mb-10 max-w-xl text-lg">
        Fale com nossa equipe. Estamos prontos para tirar suas dúvidas e ajudar você a alcançar seus objetivos.
</p>
 
      <form className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
<input
          type="text"
          placeholder="Seu nome"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
        />
<input
          type="email"
          placeholder="Seu e-mail"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
        />
<textarea
          placeholder="Sua mensagem"
          rows="4"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
></textarea>
<button className="bg-indigo-500 hover:bg-indigo-600 w-full py-3 rounded-lg font-semibold transition text-white">
          Enviar Mensagem
</button>
</form>
</div>
  );
}