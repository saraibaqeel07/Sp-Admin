"use client";
import { useEffect } from "react";
import api from "@/lib/api";

export default function MyProgressPage() {
  useEffect(() => {
    api.get("/progress-notes/my-progress")
      .then(res => console.log("my-progress data:", res.data))
      .catch(err => console.error("my-progress error:", err));
  }, []);

  return null;
}
