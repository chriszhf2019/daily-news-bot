import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SevenElementsPage from './pages/SevenElementsPage'
import RelevanceAnalysisPage from './pages/RelevanceAnalysisPage'
import DeepExplorationPage from './pages/DeepExplorationPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter basename="/newsbrief">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="seven-elements/:id" element={<SevenElementsPage />} />
          <Route path="relevance/:id" element={<RelevanceAnalysisPage />} />
          <Route path="deep-exploration/:id" element={<DeepExplorationPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
