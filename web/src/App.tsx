import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Spinner from '@/components/Spinner'
import { ToastProvider } from '@/components/Toast'

const Leaderboard = lazy(() => import('@/pages/Leaderboard'))
const RunExplorer = lazy(() => import('@/pages/RunExplorer'))
const Playground = lazy(() => import('@/pages/Playground'))
const Visualizations = lazy(() => import('@/pages/Visualizations'))
const DatasetBrowser = lazy(() => import('@/pages/DatasetBrowser'))
const Reports = lazy(() => import('@/pages/Reports'))

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <Spinner />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="leaderboard"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Leaderboard />
                </Suspense>
              }
            />
            <Route
              path="runs"
              element={
                <Suspense fallback={<PageFallback />}>
                  <RunExplorer />
                </Suspense>
              }
            />
            <Route
              path="playground"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Playground />
                </Suspense>
              }
            />
            <Route
              path="visualizations"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Visualizations />
                </Suspense>
              }
            />
            <Route
              path="datasets"
              element={
                <Suspense fallback={<PageFallback />}>
                  <DatasetBrowser />
                </Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Reports />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
