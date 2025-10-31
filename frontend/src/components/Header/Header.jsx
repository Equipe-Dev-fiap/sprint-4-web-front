import { Link, useLocation } from "react-router-dom";
 
const Header = () => {
  const location = useLocation();
 
  const linkClasses = (path) =>
    `relative px-1 hover:text-indigo-400 transition duration-300 ${
      location.pathname === path ? "text-indigo-400 font-semibold" : "text-gray-200"
    }`;
 
  return (
<header className="flex justify-between items-center px-10 py-5 border-b border-gray-700 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 shadow-md sticky top-0 z-50">
      {/* LOGO */}
<h1 className="text-3xl font-extrabold tracking-tight text-indigo-400 drop-shadow-md">
        Futebol<span className="text-white">Feminino</span>
</h1>
 
      {/* NAVEGAÇÃO */}
<nav className="flex space-x-8 text-lg font-medium">
<Link to="/home" className={linkClasses("/home")}>
          Início
</Link>
<Link to="/campeonatos" className={linkClasses("/planos")}>
          Campeonatos
</Link>
<Link to="/sobre" className={linkClasses("/sobre")}>
          Sobre
</Link>
<Link to="/contato" className={linkClasses("/contato")}>
          Contato
</Link>
</nav>
 
      {/* LINHA DE BRILHO AO PASSAR O Mouse*/}
<style>{`
        nav a::after {
          content: "";
          position: absolute;
          width: 0%;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: #818cf8; /* Indigo claro */
          transition: width 0.3s ease;
        }
        nav a:hover::after {
          width: 100%;
        }
      `}</style>
</header>
  );
};
 
export default Header;