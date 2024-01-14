import { Route, Routes } from "react-router";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import { useLayoutEffect, useState } from "react";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { Toaster } from "sonner";

const App = () => {
  const [theme, setTheme] = useState("light");

  useLayoutEffect(() => {
    const prefersDarkTheme =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(prefersDarkTheme ? "dark" : "light");
  }, []);

  return (
    <div
      className={`relative w-full min-h-screen bg-background text-text ${
        theme === "light" ? "" : "dark"
      }`}
    >
      <Toaster theme={theme === "light" ? "dark" : "light"} />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:room" element={<Room />} />
      </Routes>

      <div
        className="absolute left-0 pl-3 p-2 rounded-r-full text-secondary bottom-10 bg-primary text-xl cursor-pointer"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else setTheme("light");
        }}
      >
        <div className="hover:scale-125 transition-all duration-300 ease-in-out">
          {theme === "light" ? <IoMdMoon /> : <IoMdSunny />}
        </div>
      </div>
    </div>
  );
};

export default App;
