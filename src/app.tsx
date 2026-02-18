import React, { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { WalletProvider } from "@/contexts/wallet-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowCursor } from "@/components/arrow-cursor";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { FloatingChatButton } from "@/components/ai-chat/floating-chat-button";

const HomePage = lazy(() => import("./pages/home"));
const ContractsPage = lazy(() => import("./pages/contracts"));
const ContractDetailPage = lazy(() => import("./pages/contract-detail"));
const CreateContractPage = lazy(() => import("./pages/create-contract"));
const HowItWorksPage = lazy(() => import("./pages/how-it-works"));
const NotFoundPage = lazy(() => import("./pages/not-found"));
const BlogPage = lazy(() => import("./pages/blog"));
const HotPayIntegrationPost = lazy(() => import("./pages/blog/hot-pay-integration"));
const NovaIntegrationPost = lazy(() => import("./pages/blog/nova-integration"));
const NearProtocolPost = lazy(() => import("./pages/blog/near-protocol"));
const OpenClawIntegrationPost = lazy(() => import("./pages/blog/openclaw-integration"));
const RentahumanIntegrationPost = lazy(() => import("./pages/blog/rentahuman-integration"));
const DocsPage = lazy(() => import("./pages/docs"));
const DocViewer = lazy(() => import("./pages/docs/doc-viewer"));

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
        <Sonner />
        <SmoothScrollProvider>
          <BrowserRouter>
            <Navbar />
            <HotPayRedirect />
            <div className="h-[5.5rem]" aria-hidden />
            <Suspense fallback={null}>
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
            </Suspense>
            <ConditionalFooter />
            <FloatingChatButton />
          </BrowserRouter>
        </SmoothScrollProvider>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
