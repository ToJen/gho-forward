import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Signature from "./Singature";
import SignatureRepay from "./SingatureRepay";

export const BaseRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<Signature />} />
      <Route path="/test2" element={<SignatureRepay />} />
    </Routes>
  );
};
