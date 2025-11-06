import React from 'react';
// config.jsから認証関連の関数はもう必要ありません。
// 以前作成したコンポーネントとフックをインポート
import { Header } from './components/header';
import { useHeaderData } from './hooks/useHeaderData';

// 認証ユーザーIDと認証ローディング状態を取得するためのヘルパーフック (削除)
/*
const useAuthId = () => {
    // ... 削除されたロジック
};
*/


export default function App() {
    // 1. データ取得フックの利用 (Firebaseの初期化・認証、データ取得の全てを含む)
    const [headerData, isDataLoading, userId, isAuthLoading] = useHeaderData();
    
    // 2. 認証情報フックの利用 (削除)
    // const [userId, isAuthLoading] = useAuthId();

    // 3. 総合的なローディング状態
    // データの読み込み、または認証状態の確定に時間がかかっている場合
    const isLoading = isAuthLoading || isDataLoading;

    // メニュー項目 (変更なし)
    const menuItems = [
        { href: "counterlocal.html", color: "bg-orange-500 hover:bg-orange-600 text-white", label: "🟠 地域優先入場カウンター" },
        { href: "counter.html", color: "bg-green-600 hover:bg-green-700 text-white", label: "🟢 入場口カウンター" },
        { href: "counterout.html", color: "bg-red-600 hover:bg-red-700 text-white", label: "🔴 出口カウンター" },
        { href: "report.html", color: "bg-yellow-400 hover:bg-yellow-500 text-gray-800", label: "📝 トラブル等記録" },
        { href: "wait.html", color: "bg-blue-300 hover:bg-blue-400 text-black", label: "🕒 待ち時間計算" },
    ];

    return (
        <div className="font-sans bg-gray-100 min-h-screen flex flex-col">
            {/* Headerコンポーネントを配置し、データを渡す */}
            <Header
                userId={userId}
                isLoading={isLoading}
                data={headerData}
            />

            <main className="main-content flex flex-col items-center flex-grow py-6 px-4">
                <div className="w-full max-w-xl flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">カウンターメニュー</h1>
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
