import axios from "axios";
import React, { useEffect, useState } from "react";
import "../index.css";

function Chat() {
  const [msg, setMsg] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages"));
    if (storedMessages) {
      setMsg(storedMessages);
    }
  }, []);

  const sendMessage = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/chat", {
        message: input,
        user: "user",
      });

      const updatedMsg = [...msg, { user: "patient", text: input }];
      setMsg(updatedMsg);
      setInput("");

      // Store updated chat messages in local storage
      localStorage.setItem("chatMessages", JSON.stringify(updatedMsg));

      setTimeout(() => {
        const botResponse = { user: "bot", text: response.data.response };
        const updatedMsgWithBot = [...updatedMsg, botResponse];
        setMsg(updatedMsgWithBot);
        localStorage.setItem("chatMessages", JSON.stringify(updatedMsgWithBot));
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="border mx-72 my-10 p-10 rounded-md bg-blue-300">
      <div className="space-y-2">
        {msg.map((message, index) => (
          <div
            key={index}
            className={
              message.user === "patient"
                ? "patient-message bg-blue-100 rounded-2xl w-fit p-1"
                : "bot-message bg-green-100 rounded-2xl w-fit p-1"
            }
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="flex mt-20 justify-end">
        <input
          className="border border-blue-300 outline-none "
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <a onClick={sendMessage}>
          <img src="/send.png" className="w-10" />
        </a>
      </div>
    </div>
  );
}

export default Chat;
