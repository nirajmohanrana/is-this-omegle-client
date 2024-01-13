import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  const socket = useSocket();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;

      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);

  return (
    <div>
      <h2>Lobby</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email ID</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <br />
        <label htmlFor="room">Room No</label>
        <input
          id="room"
          type="text"
          value={room}
          onChange={(e) => {
            setRoom(e.target.value);
          }}
        />
        <br />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default Lobby;
