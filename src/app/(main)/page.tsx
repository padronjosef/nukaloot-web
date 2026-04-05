import { HomeTemplate } from "../components/home/templates/HomeTemplate";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "http://localhost:3002";

const fetchGames = async (endpoint: string) => {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/games/${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) return { items: [], rateLimited: false };
    return await res.json();
  } catch {
    return { items: [], rateLimited: false };
  }
};

const Home = async () => {
  const [featured, topSellers] = await Promise.all([
    fetchGames("featured"),
    fetchGames("top-sellers"),
  ]);

  return (
    <HomeTemplate
      featuredGames={Array.isArray(featured?.items) ? featured.items : Array.isArray(featured) ? featured : []}
      topSellers={Array.isArray(topSellers?.items) ? topSellers.items : Array.isArray(topSellers) ? topSellers : []}
      rateLimited={featured?.rateLimited || topSellers?.rateLimited || false}
    />
  );
};

export default Home;
