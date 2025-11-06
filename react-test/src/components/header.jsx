import React from 'react';
// appIdをconfigから直接インポート
import { appId as globalAppId } from '../firebase/config'; 

/**
 * QRコードのプレースホルダーコンポーネント
 */
const QrCodePlaceholder = () => (
    <div className="text-xs text-gray-400 text-center">QR画像未設定</div>
);

/**
 * Headerコンポーネント (header.htmlをReact/JSXで再現)
 * リアルタイムデータはPropsとして受け取る
 * @param {object} props 
 * @param {string | null} props.userId - 認証ユーザーID (親コンポーネントの認証フックから取得)
 * @param {boolean} props.isLoading - 認証またはデータ読み込み中フラグ (親コンポーネントでuseHeaderDataと認証状態を結合)
 * @param {object} props.data - useHeaderDataから取得した表示データ
 */
export const Header = ({ userId, isLoading, data }) => {
    // configから直接appIdを取得
    const appId = globalAppId; 

    // dataがnullの場合のフォールバックを初期データとして設定
    const defaultData = {
        currentCount: 0, localInCount: 0, exitInCount: 0, waitTime: '--',
        day1Date: '[--/--]', day1Visitors: 0, day2Date: '[--/--]', day2Visitors: 0,
        totalVisitors: 0,
    };
    const displayData = data || defaultData;

    return (
        // bg-cyan-view は tailwind.config.js で定義されたカスタムカラー
        <header id="info-header" className="bg-cyan-view text-white p-2 flex-shrink-0 z-10 shadow-lg">
            <div className="max-w-4xl mx-auto flex justify-between items-start space-x-4">
                
                {/* QRコードコンテナ */}
                <div id="qr-code-container" className="w-24 h-24 flex-shrink-0 bg-white p-1 rounded-lg shadow-inner flex items-center justify-center border-2 border-cyan-200">
                    <QrCodePlaceholder />
                </div>

                {/* 情報エリア */}
                <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0 text-right">
                    
                    {/* 場内人数表示 */}
                    <div id="current-count-display" className="text-lg md:text-lg font-bold flex items-end justify-end flex-wrap gap-x-2">
                        場内人数:
                        <span id="current-count-value" className="ml-2 text-4xl text-yellow-300 tabular-nums">
                            {displayData.currentCount}
                        </span>
                        <span className="text-sm md:text-base opacity-80">
                            （内、優先入場:<span id="localin-count" className="tabular-nums">{displayData.localInCount}</span>
                            出口:<span id="exitin-count" className="tabular-nums">{displayData.exitInCount}</span>）
                        </span>
                    </div>

                    {/* 待ち時間表示 */}
                    <div id="wait-time-display" className="w-full text-base md:text-lg font-light opacity-95">
                        100人当たり待ち時間:
                        <span id="wait-time-value" className="font-bold tabular-nums ml-1">
                            {displayData.waitTime}
                        </span>分
                    </div>

                    {/* 過去来場者数表示 */}
                    <div className="w-full text-sm md:text-base font-light opacity-90 pt-1 border-t border-cyan-400/50">
                        <span id="event-day1-date">{displayData.day1Date}</span>
                        <span className="font-bold ml-1 tabular-nums" id="day1-visitors">：{displayData.day1Visitors}人</span>
                        
                        <span className="mx-2 hidden sm:inline"></span>
                        <br className="sm:hidden"/> 

                        <span id="event-day2-date">{displayData.day2Date}</span>
                        <span className="font-bold ml-1 tabular-nums" id="day2-visitors">：{displayData.day2Visitors}人</span>
                        
                        <span className="mx-2"></span>
                        
                        <span>[計]</span>
                        <span className="font-bold ml-1 tabular-nums" id="total-visitors">：{displayData.totalVisitors}人</span>
                    </div>
                </div>
            </div>
            
            {/* 認証情報表示 (デバッグ用/ユーザー識別用) */}
            <div className="max-w-4xl mx-auto pt-1 mt-1 border-t border-cyan-400/50 text-right">
                {isLoading ? (
                    <span className="text-xs text-gray-200">認証中...</span>
                ) : (
                    <div className="text-xs text-gray-200 truncate max-w-full">
                        User ID: {userId || 'N/A'} (App ID: {appId})
                    </div>
                )}
            </div>
        </header>
    );
};
