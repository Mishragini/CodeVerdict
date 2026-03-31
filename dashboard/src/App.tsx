import { Provider } from "react-redux";
import { Dashboard } from "./_components/Dashboard";
import { Install } from "./_components/Install";
import { Login } from "./_components/Login";
import "./App.css";
import { Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./redux/store";

function App() {
  const client = new QueryClient();
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <QueryClientProvider client={client}>
              <Provider store={store}>
                <Dashboard />
              </Provider>
            </QueryClientProvider>
          }
        />
        <Route path="/install" element={<Install />} />
      </Routes>
    </>
  );
}

export default App;
