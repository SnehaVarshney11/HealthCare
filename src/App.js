import "./App.css";
import Chat from "./Components/Chat";
import "./index.css";

function App() {
  return (
    <div>
      <h1 className="mt-10 flex justify-center text-3xl font-bold">
        Medical ChatBot
      </h1>
      <Chat />
    </div>
  );
}

export default App;
