import React from "react";
import SampleCard from "./components/SampleCard.jsx";

export default function App() {
  return (
    <div style={{ textAlign: "center", padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🔥 React テストページ</h1>
      <p>GitHub Actions経由で自動ビルド・デプロイされています。</p>
      <SampleCard />
    </div>
  );
}
