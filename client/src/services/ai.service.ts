// ai.service.ts
export async function aiSearch(message: string) {
  // ВАЖНО: Замените http://localhost:4000 на реальный адрес вашего бэкенда
  const BACKEND_URL = "http://localhost:3001"; 
  
  const res = await fetch(`${BACKEND_URL}/api/ai/search`, {
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