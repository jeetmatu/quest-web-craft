import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AddFish from "./pages/seller/AddFish";
import MyFish from "./pages/seller/MyFish";
import ViewOffers from "./pages/seller/ViewOffers";
import SavedContacts from "./pages/seller/SavedContacts";
import FishList from "./pages/buyer/FishList";
import MakeOffer from "./pages/buyer/MakeOffer";
import TrackOffers from "./pages/buyer/TrackOffers";
import PurchaseHistory from "./pages/buyer/PurchaseHistory";
import BuyerContacts from "./pages/buyer/SavedContacts";
import ManageUsers from "./pages/admin/ManageUsers";
import ViewTransactions from "./pages/admin/ViewTransactions";
import ManageListings from "./pages/admin/ManageListings";
import Reports from "./pages/admin/Reports";
import SystemSettings from "./pages/admin/SystemSettings";
import Messages from "./pages/Messages";
import ViewReports from "./pages/admin/ViewReports";
import ViewRecords from "./pages/seller/ViewRecords";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/add-fish" element={<AddFish />} />
          <Route path="/seller/my-fish" element={<MyFish />} />
          <Route path="/seller/view-offers" element={<ViewOffers />} />
          <Route path="/seller/contacts" element={<SavedContacts />} />
          <Route path="/seller/view-records" element={<ViewRecords />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/buyer/fish-list" element={<FishList />} />
          <Route path="/buyer/make-offer" element={<MakeOffer />} />
          <Route path="/buyer/track-offers" element={<TrackOffers />} />
          <Route path="/buyer/purchase-history" element={<PurchaseHistory />} />
          <Route path="/buyer/contacts" element={<BuyerContacts />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/transactions" element={<ViewTransactions />} />
          <Route path="/admin/listings" element={<ManageListings />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/view-reports" element={<ViewReports />} />
          <Route path="/messages" element={<Messages />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
