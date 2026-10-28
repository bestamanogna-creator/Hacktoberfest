import React from "react";
import {Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import RepositoryExplorer from "./pages/RepositoryExplorer";
import IssuesExplorer from "./pages/IssuesExplorer";
import ContributionAssistant from "./pages/ContributionAssistant";
import TestingGuide from "./pages/TestingGuide";

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/repositories" element={<RepositoryExplorer/>}/>
    <Route path="/issues" element={<IssuesExplorer/>}/>
    <Route
  path="/assistant"
  element={<ContributionAssistant />}
/>
    <Route path="/testing" element={<TestingGuide/>}/>
  </Routes></Layout>; 
}
