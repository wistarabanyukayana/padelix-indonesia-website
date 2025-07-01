import { API_URL } from "@/utils/db";

async function getData() {
  const path = `/api/home-page`;
  const dataURL = new URL(path, API_URL);

  console.log("[Calling API]:", dataURL.href); // ✅ log here

  const response = await fetch(dataURL.href);
  const data = await response.json();

  return { ...data.data };
}

export default async function Home() {
  const data = await getData();
  console.log(data);

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
