import { Route, Routes } from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Layout } from './components/Layout'
import { Container, Spinner } from './components/ui'
import { useData } from './data/DataContext'
import { Overview } from './pages/Overview'
import { Methodology } from './pages/Methodology'
import { BattingRankings } from './pages/BattingRankings'
import { BowlingRankings } from './pages/BowlingRankings'
import { BatterExplorer } from './pages/BatterExplorer'
import { BowlerExplorer } from './pages/BowlerExplorer'
import { PlayerProfile } from './pages/PlayerProfile'
import { Reliability } from './pages/Reliability'
import { DataDownloads } from './pages/DataDownloads'

function NotFound() {
  return (
    <Container>
      <div className="card p-10 text-center">
        <p className="kicker mb-2">404</p>
        <h1 className="font-display text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">The page you requested does not exist in this dashboard.</p>
        <a href="#/" className="btn btn-primary mt-5">Back to overview</a>
      </div>
    </Container>
  )
}

export default function App() {
  const { loading, error } = useData()

  if (loading) {
    return (
      <div className="min-h-screen">
        <Spinner label="Loading the scored dataset" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold text-white">The dashboard data could not be loaded</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{error}</p>
          <p className="mt-2 text-xs text-slate-500">Run <span className="font-mono text-slate-300">python analysis/scripts/08_export_submission.py</span> from the project root, then reload.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" /> Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/batting" element={<BattingRankings />} />
        <Route path="/bowling" element={<BowlingRankings />} />
        <Route path="/batters" element={<BatterExplorer />} />
        <Route path="/bowlers" element={<BowlerExplorer />} />
        <Route path="/player/:kind/:id" element={<PlayerProfile />} />
        <Route path="/reliability" element={<Reliability />} />
        <Route path="/data" element={<DataDownloads />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
