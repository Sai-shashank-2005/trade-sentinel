import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import PageWrapper from "./components/PageWrapper";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import LiveTrade from "./pages/LiveTrade";

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto bg-gray-950 p-8">
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Layout>

      <AnimatePresence mode="wait">

        <Routes location={location} key={location.pathname}>

          <Route
            path="/"
            element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            }
          />

          <Route
            path="/upload"
            element={
              <PageWrapper>
                <Upload />
              </PageWrapper>
            }
          />

          <Route
            path="/transactions"
            element={
              <PageWrapper>
                <Transactions />
              </PageWrapper>
            }
          />

          <Route
            path="/transactions/:id"
            element={
              <PageWrapper>
                <TransactionDetail />
              </PageWrapper>
            }
          />

          <Route
            path="/live-trade"
            element={
              <PageWrapper>
                <LiveTrade />
              </PageWrapper>
            }
          />

        </Routes>

      </AnimatePresence>

    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}