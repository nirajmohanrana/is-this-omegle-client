import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { IoMdCopy } from "react-icons/io";
import { TbCameraShare, TbPhoneCall } from "react-icons/tb";
import { TbHomeOff } from "react-icons/tb";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteEmail, setRemoteEmail] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const location = useLocation();
  const roomId = location.pathname.split("/")[2];

  function copyToClipboard() {
    navigator.clipboard.writeText(roomId).then(
      () => {
        toast(`Room Id: ${roomId} copied to clipboard`);
      },
      (err) => {
        console.error("Unable to copy text to clipboard", err);
      }
    );
  }

  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteEmail(email);
    toast(`${email} Joined the Room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const myEmail = localStorage.getItem("myMail");
    const offer = await peer.getOffer();
    socket.emit("user:call", { email: myEmail, to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ fromMail, from, offer }) => {
      setRemoteEmail(fromMail);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const handleIncomingMessages = useCallback((message) => {
    console.log("Incoming Message:", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  useEffect(() => {
    const dynamicEventKey = `chat:message:${roomId}`;
    console.log(`Setting up event listener for ${dynamicEventKey}`);

    // Set up event listener for incoming chat messages
    socket.on(dynamicEventKey, handleIncomingMessages);

    return () => {
      // Clean up on unmount
      console.log(`Removing event listener for ${dynamicEventKey}`);
      socket.off(dynamicEventKey, handleIncomingMessages);
    };
  }, [handleIncomingMessages, roomId, socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (newMessage.trim() !== "") {
      const dynamicEventKey = `chat:message:${roomId}`;
      console.log(`Sending message to ${dynamicEventKey}`);
      socket.emit("chat:message", {
        room: roomId,
        message: newMessage,
        dynamicEventKey,
      });
      setNewMessage("");
    }
  };

  return (
    <div className="w-full md:max-w-7xl mx-auto">
      <nav className="flex items-center px-5 bg-primary h-12 gap-x-2">
        <h3 className="text-xl font-bold text-secondary flex-1">
          IS THIS OMEGLE
        </h3>

        <p className="text-secondary text-sm">
          Room Id: <span className="italic">{roomId}</span>
        </p>
        <IoMdCopy
          className="text-secondary text-sm cursor-pointer"
          onClick={copyToClipboard}
        />
      </nav>

      <div className="px-2 h-[calc(100vh-3rem)]">
        <div>
          {remoteSocketId ? (
            <div className="text-right">
              <p className="text-xs opacity-50">
                You&apos;re connected to {remoteEmail}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-5">
              <TbHomeOff className="text-3xl" />
              <p className="text-xl">No one in room</p>
            </div>
          )}
        </div>

        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="flex justify-center items-center px-2 py-1 text-xs bg-gradient-to-b from-green-300 hover:from-green-600 to-green-600 hover:to-green-300 rounded-lg text-white font-bold gap-x-1 my-2"
          >
            <TbPhoneCall className="text-lg" />
            CALL {remoteEmail}
          </button>
        )}

        {myStream && (
          <button
            onClick={sendStreams}
            className="flex justify-center items-center px-2 py-1 text-xs bg-gradient-to-b from-green-300 hover:from-green-600 to-green-600 hover:to-green-300 rounded-lg text-white font-bold gap-x-1 my-2"
          >
            <TbCameraShare className="text-lg" />
            Send Stream
          </button>
        )}

        {remoteSocketId && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="mb-2 md:w-1/3 flex md:flex-col justify-center gap-2">
              {remoteStream && (
                <div className="border-2 border-accent rounded-md overflow-hidden">
                  <ReactPlayer
                    playing
                    url={remoteStream}
                    width="100%"
                    height="100%"
                  />
                </div>
              )}

              {myStream && (
                <div className="border-2 border-green-500 rounded-md overflow-hidden">
                  <ReactPlayer
                    playing
                    muted
                    url={myStream}
                    width="100%"
                    height="100%"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col-reverse h-[calc(100vh-10rem)] border-2 border-text rounded-md overflow-hidden overflow-y-auto p-1">
              <form
                className="flex items-center gap-x-4 px-4 py-2"
                onSubmit={handleSendMessage}
              >
                <input
                  className="bg-accent appearance-none border-2 font-bold border-text rounded w-full py-2 px-4 text-background leading-tight focus:outline-none focus:bg-text focus:border-accent"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="h-full bg-secondary px-4 rounded"
                  type="submit"
                >
                  SEND
                </button>
              </form>

              <div className="py-4 h-[calc(100vh-28rem)]">
                {messages.map((message, i) => {
                  return message.from === socket.id ? (
                    // ME
                    <div key={i} className="w-full flex justify-end px-6">
                      <div className="flex justify-end items-center gap-x-1 w-fit bg-green-700 rounded-lg my-2 px-2 py-1 relative">
                        <p className="text-[10px] font-bold opacity-50 uppercase">
                          You
                        </p>
                        <div className="text-base">{message.message}</div>

                        <div className="absolute w-3 overflow-hidden inline-block top-2 -right-2">
                          <div className=" h-6 bg-green-700 rotate-45 transform origin-top-left" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Other
                    <div key={i} className="w-full flex justify-start px-6">
                      <div className="flex justify-start flex-row-reverse items-center gap-x-1 w-fit bg-blue-600 rounded-lg my-2 px-2 py-1 relative">
                        <p className="text-[8px] font-bold opacity-50 uppercase">
                          {remoteEmail}
                        </p>
                        <div className="text-base">{message.message}</div>

                        <div className="absolute w-3 overflow-hidden inline-block top-2 -left-2">
                          <div className=" h-6 bg-blue-600 -rotate-45 transform origin-top-right" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
