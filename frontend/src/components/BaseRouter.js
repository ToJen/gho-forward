import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Signature from "./Singature";

export const BaseRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<Signature />} />
    </Routes>
  );
};
