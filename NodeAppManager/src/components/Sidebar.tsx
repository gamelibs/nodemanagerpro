export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-[#1E293B]">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-text-primary mb-6">Node App Manager</h1>
        <nav className="space-y-2">
          <button className="sidebar-item">
            <span className="mr-3">📁</span> Projects
          </button>
          <button className="sidebar-item">
            <span className="mr-3">⚙️</span> Settings
          </button>
        </nav>
      </div>
    </aside>
  );
}
