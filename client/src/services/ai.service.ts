// ai.service.ts
// Базовый адрес API берём из той же переменной, что и остальной клиент
// (NEXT_PUBLIC_API_URL уже включает суффикс "/api", напр. https://my-api.com/api).
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function aiSearch(message: string) {
  const res = await fetch(`${API_URL}/ai/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Server Error:", errorText);
    throw new Error(`Server error: ${res.status} ${errorText}`);
  }

  return res.json();
}