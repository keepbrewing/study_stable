import { BrowserRouter, Routes, Route } from "react-router-dom";
import Participant  from "./pages/Participant";
import Friend from "./pages/Friend";
import Pd from "./pages/Pd";
import Affect from "./pages/Affect";
import Task from "./pages/Task";
import Gonogo from "./pages/Gonogo";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Participant />}></Route>
        <Route path="/friend" element={<Friend />}></Route>
        <Route path="/pd" element={<Pd />}></Route>
        <Route path="/affect" element={<Affect />}></Route>
        <Route path="/task" element={<Task />}></Route>
        <Route path="/gonogo" element={<Gonogo />}></Route>
        <Route path="/thankyou" element={<ThankYou />}></Route>
        <Route path="/admin" element={<Admin />}></Route>
        <Route path="/admin-login" element={<AdminLogin />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;