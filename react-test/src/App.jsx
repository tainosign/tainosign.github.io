export default function App() {
  const menuItems = [
    { href: "counterlocal.html", color: "bg-orange-500 hover:bg-orange-600 text-white", label: "🟠 地域優先入場カウンター" },
    { href: "counter.html", color: "bg-green-600 hover:bg-green-700 text-white", label: "🟢 入場口カウンター" },
    { href: "counterout.html", color: "bg-red-600 hover:bg-red-700 text-white", label: "🔴 出口カウンター" },
    { href: "report.html", color: "bg-yellow-400 hover:bg-yellow-500 text-gray-800", label: "📝 トラブル等記録" },
    { href: "wait.html", color: "bg-blue-300 hover:bg-blue-400 text-black", label: "🕒 待ち時間計算" },
  ];

  return (
    <div className="font-sans bg-gray-100 min-h-screen flex flex-col">
      <main className="main-content flex flex-col items-center flex-grow py-6">
        <div className="w-full max-w-xl flex flex-col gap-4">
          {menuItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={`menu-link p-8 rounded-2xl text-2xl font-bold flex justify-center items-center h-24 transition shadow-md ${item.color}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
