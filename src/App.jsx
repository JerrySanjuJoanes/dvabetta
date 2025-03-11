// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthLayout";
import Map from "./pages/Map";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
