import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Lesson } from "@/components/Lesson";
import { Home } from "@/components/Home";
import { ProblemSolving } from "@/components/ProblemSolving";
import { DeepDive } from "@/components/DeepDive";
import { Interview } from "@/components/Interview";
import { lessons } from "@/data/lessons";

export function App() {
  return (
    <div className="min-h-full px-3 py-3 text-zinc-100 sm:px-4 lg:px-5">
      <div className="app-panel flex min-h-[calc(100vh-1.5rem)] flex-col overflow-hidden">
        <Header lessons={lessons} />
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <Sidebar lessons={lessons} />
          <Routes>
            <Route path="/" element={<Home lessons={lessons} />} />
            <Route path="/deep-dive" element={<DeepDive />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/ps" element={<ProblemSolving />} />
            <Route path="/lesson/:id" element={<Lesson lessons={lessons} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
