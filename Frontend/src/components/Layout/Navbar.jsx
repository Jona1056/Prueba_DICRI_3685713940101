import useUIStore from "../store/uiStore";

export default function Navbar() {
  const { toggleSidebar } = useUIStore();

  return (
    <nav className="top-navbar">
      <button className="menu-btn" onClick={toggleSidebar}>
        <i className="pi pi-bars"></i>
      </button>
      <h3>SISTEMA DICRI</h3>
    </nav>
  );
}
