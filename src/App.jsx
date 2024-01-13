import { Route, Routes } from "react-router";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:room" element={<Room />} />
      </Routes>
    </div>
  );
};

export default App;
