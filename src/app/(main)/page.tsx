import { Suspense } from "react";
import { HomeTemplate } from "../components/home/templates/HomeTemplate";

const Home = () => {
  return (
    <Suspense>
      <HomeTemplate />
    </Suspense>
  );
};

export default Home;
