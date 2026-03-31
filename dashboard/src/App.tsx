import { Dashboard } from "./_components/Dashboard";
import { Install } from "./_components/Install";
import { Login } from "./_components/Login";
import "./App.css";
import { Routes, Route } from "react-router";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/install" element={<Install />} />
      </Routes>
    </>
  );
}

export default App;
