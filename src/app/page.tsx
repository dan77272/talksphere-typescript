import HomePage from "./components/Home";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="h-screen min-h-[700px] flex flex-col">
      <Navbar/>
      <HomePage/>
    </div>
  );
}
