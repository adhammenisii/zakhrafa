import React from "react";
import { useStore } from "../lib/store.jsx";
import { INK } from "./ui.jsx";

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div className="toast-anim" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: INK, color: "#fff", padding: "11px 20px", borderRadius: 2, fontSize: 13, zIndex: 70, maxWidth: "90vw", textAlign: "center" }}>
      {toast}
    </div>
  );
}
