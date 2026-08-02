import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { NewPaste } from './pages/NewPaste'
import { ViewPaste } from './pages/ViewPaste'
import { MyPastes } from './pages/MyPastes'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <Link to="/" className="brand">
          paste<span className="brand-dot">.</span>hamdy.app
        </Link>
        <nav>
          <NavLink to="/" end>new</NavLink>
          <NavLink to="/mine">my pastes</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<NewPaste />} />
          <Route path="/mine" element={<MyPastes />} />
          <Route path="/:id" element={<ViewPaste />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
