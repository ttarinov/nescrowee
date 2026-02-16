import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/wallet-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ArrowCursor } from "@/components/arrow-cursor";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import HomePage from "./pages/home";
import ContractsPage from "./pages/contracts";
import ContractDetailPage from "./pages/contract-detail";
import CreateContractPage from "./pages/create-contract";
import HowItWorksPage from "./pages/how-it-works";
import NotFoundPage from "./pages/not-found";

const queryClient = new QueryClient();

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
            <div className="h-[5.5rem]" aria-hidden />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/create" element={<CreateContractPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </SmoothScrollProvider>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
