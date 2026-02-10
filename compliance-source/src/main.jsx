import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import BatchEmail from './pages/BatchEmail'
import CommunicationLog from './pages/CommunicationLog'
import BuyerSubmission from './pages/BuyerSubmission'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/batch-email" element={<BatchEmail />} />
          <Route path="/communications" element={<CommunicationLog />} />
        </Route>
        {/* Buyer submission is standalone (no sidebar) */}
        <Route path="/submit" element={<BuyerSubmission />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
