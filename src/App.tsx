import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { NewPaste } from './pages/NewPaste'
import { ViewPaste } from './pages/ViewPaste'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <Link to="/" className="brand">
          paste<span className="brand-dot">.</span>hamdy.app
        </Link>
        <nav>
          <Link to="/">new paste</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<NewPaste />} />
          <Route path="/:id" element={<ViewPaste />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
