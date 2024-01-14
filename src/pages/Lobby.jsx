import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { FaDice } from "react-icons/fa";
import { toast } from "sonner";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  const socket = useSocket();

  const generateRoomId = useCallback((e) => {
    e.preventDefault();

    const alphanumericChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
      code += alphanumericChars.charAt(randomIndex);
    }

    setRoom(code);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      localStorage.setItem("myMail", email);

      if (!validateEmail(email)) {
        toast("Please Enter Correct mail");
        return;
      }

      if (room.length < 6) {
        toast("Please Enter Minimum 6 leters");
        return;
      }

      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;

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
      <div className="flex flex-col gap-10 justify-center items-center h-screen">
        <h2 className="text-2xl text-primary font-bold">IS THIS OMEGLE</h2>
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
              <label
                className="block font-bold md:text-right mb-1 md:mb-0 pr-4"
                htmlFor="email"
              >
                Email :
              </label>
            </div>
            <div className="md:w-2/3">
              <input
                className="bg-accent appearance-none border-2 font-bold border-text rounded w-full py-2 px-4 text-background leading-tight focus:outline-none focus:bg-text focus:border-accent"
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
              <label
                className="block font-bold md:text-right mb-1 md:mb-0 pr-4"
                htmlFor="room-id"
              >
                Room Id :
              </label>
            </div>
            <div className="md:w-2/3 flex gap-2 items-center">
              <input
                className="bg-accent appearance-none border-2 font-bold border-text rounded w-full py-2 px-4 text-background leading-tight focus:outline-none focus:bg-text focus:border-accent"
                id="room-id"
                type="text"
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                }}
              />
              <button
                className="bg-secondary p-2 rounded"
                onClick={generateRoomId}
              >
                <FaDice className="text-2xl" />
              </button>
            </div>
          </div>

          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3" />
            <div className="md:w-2/3 block text-primary font-bold text-sm">
              <p>Ask for Room Id from your Friend</p>
              <p>Don&apos;t have Room Id generate one and start a new room</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="shadow bg-secondary hover:bg-accent focus:shadow-outline focus:outline-none font-bold py-2 px-4 rounded"
              type="submit"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
