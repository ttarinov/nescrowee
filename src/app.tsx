import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { WalletProvider } from "@/contexts/wallet-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ArrowCursor } from "@/components/arrow-cursor";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { FloatingChatButton } from "@/components/ai-chat/floating-chat-button";
import HomePage from "./pages/home";
import ContractsPage from "./pages/contracts";
import ContractDetailPage from "./pages/contract-detail";
import CreateContractPage from "./pages/create-contract";
import HowItWorksPage from "./pages/how-it-works";
import NotFoundPage from "./pages/not-found";
import BlogPage from "./pages/blog";
import HotPayIntegrationPost from "./pages/blog/hot-pay-integration";
import NovaIntegrationPost from "./pages/blog/nova-integration";
import NearProtocolPost from "./pages/blog/near-protocol";
import OpenClawIntegrationPost from "./pages/blog/openclaw-integration";
import RentahumanIntegrationPost from "./pages/blog/rentahuman-integration";
import DocsPage from "./pages/docs";
import DocViewer from "./pages/docs/doc-viewer";

const queryClient = new QueryClient();

const MARKETING_ROUTES = ["/", "/how-it-works", "/blog", "/docs"];

function HotPayRedirect() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    if (pathname !== "/") return;
    const raw = localStorage.getItem("hotpay-pending");
    if (!raw) return;
    localStorage.removeItem("hotpay-pending");
    try {
      const { contractId } = JSON.parse(raw);
      if (contractId) navigate(`/contracts/${contractId}`, { replace: true });
    } catch { /* ignore */ }
  }, [pathname, navigate]);

  return null;
}

function ConditionalFooter() {
  const { pathname } = useLocation();
  const isMarketing = MARKETING_ROUTES.some(
    (r) => pathname === r || pathname.startsWith("/blog/") || pathname.startsWith("/docs/"),
  );
  return isMarketing ? <Footer /> : null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <ArrowCursor />
        <Toaster />
        <Sonner />
        <SmoothScrollProvider>
          <BrowserRouter>
            <Navbar />
            <HotPayRedirect />
            <div className="h-[5.5rem]" aria-hidden />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/create" element={<CreateContractPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/hot-pay-integration" element={<HotPayIntegrationPost />} />
              <Route path="/blog/nova-integration" element={<NovaIntegrationPost />} />
              <Route path="/blog/near-protocol" element={<NearProtocolPost />} />
              <Route path="/blog/openclaw-integration" element={<OpenClawIntegrationPost />} />
              <Route path="/blog/rentahuman-integration" element={<RentahumanIntegrationPost />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/docs/:docId" element={<DocViewer />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <ConditionalFooter />
            <FloatingChatButton />
          </BrowserRouter>
        </SmoothScrollProvider>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
