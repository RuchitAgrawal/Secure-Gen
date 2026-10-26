import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Leaderboard from '@/pages/Leaderboard'
import RunExplorer from '@/pages/RunExplorer'
import Playground from '@/pages/Playground'
import Visualizations from '@/pages/Visualizations'
import DatasetBrowser from '@/pages/DatasetBrowser'
import Reports from '@/pages/Reports'

import { ToastProvider } from '@/components/Toast'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="runs" element={<RunExplorer />} />
            <Route path="playground" element={<Playground />} />
            <Route path="visualizations" element={<Visualizations />} />
            <Route path="datasets" element={<DatasetBrowser />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
