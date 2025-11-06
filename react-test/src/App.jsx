import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getApp } from 'firebase/app';
// 以前作成したコンポーネントとフックをインポート
import { Header } from './components/header';
import { useHeaderData } from './hooks/useHeaderData';

// 認証ユーザーIDと認証ローディング状態を取得するためのヘルパーフック
// (本来は専用ファイルに切り出すべきですが、App.jsx内で簡略化)
const useAuthId = () => {
    const [userId, setUserId] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        try {
            // config.jsでFirebaseが初期化されていることを前提に、Authインスタンスを取得
            const auth = getAuth(getApp()); 
            
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUserId(user ? user.uid : null);
                setIsAuthLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to get Firebase Auth instance:", error);
            setIsAuthLoading(false);
        }
    }, []);

    return [userId, isAuthLoading];
};


export default function App() {
    // 1. データ取得フックの利用
    const [headerData, isDataLoading] = useHeaderData();
    
    // 2. 認証情報フックの利用
    const [userId, isAuthLoading] = useAuthId();

    // 3. 総合的なローディング状態
    const isLoading = isAuthLoading || isDataLoading;

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
