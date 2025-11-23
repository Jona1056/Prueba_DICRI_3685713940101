import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./layout.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <Navbar />
        <div className="layout-body">{children}</div>
      </div>
    </div>
  );
}
