import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import NotFound from "./pages/NotFound";
// Seller pages
import AddProduct from "./pages/seller/AddProduct";
import MyProducts from "./pages/seller/MyProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerReviews from "./pages/seller/SellerReviews";
// Customer pages
import ProductList from "./pages/customer/ProductList";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import WriteReview from "./pages/customer/WriteReview";
import MyReviews from "./pages/customer/MyReviews";

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
          {/* Seller Routes */}
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/add-product" element={<AddProduct />} />
          <Route path="/seller/my-products" element={<MyProducts />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/reviews" element={<SellerReviews />} />
          {/* Customer Routes */}
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/buyer/products" element={<ProductList />} />
          <Route path="/buyer/cart" element={<Cart />} />
          <Route path="/buyer/checkout" element={<Checkout />} />
          <Route path="/buyer/orders" element={<Orders />} />
          <Route path="/buyer/review/:orderId" element={<WriteReview />} />
          <Route path="/buyer/my-reviews" element={<MyReviews />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;