
const Footer = () => {
  return (
<footer className="text-center py-6 border-t border-gray-700 bg-gray-900 text-gray-400 text-sm">
<p>© {new Date().getFullYear()} Passa-Bola — Todos os direitos reservados.</p>
<div className="flex justify-center space-x-4 mt-3">
<a href="#" className="hover:text-indigo-400 transition">Instagram</a>
<a href="#" className="hover:text-indigo-400 transition">Facebook</a>
<a href="#" className="hover:text-indigo-400 transition">YouTube</a>
</div>
</footer>
  );
};
 
export default Footer;