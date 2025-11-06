import React from "react";

export default function SampleCard() {
  return (
    <div
      style={{
        background: "#f0f0f0",
        borderRadius: "12px",
        padding: "16px",
        margin: "16px auto",
        width: "80%",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}
    >
      <h2>コンポーネント動作確認</h2>
      <p>このカードが見えたらReactは正常にビルドされています。</p>
    </div>
  );
}
