-- Create products table (replacing fish_listings concept with pet food products)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  pet_type TEXT NOT NULL, -- dog, cat, bird, fish, etc.
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  nutrition_details TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (stock_quantity > 0);

CREATE POLICY "Sellers can create products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own products"
ON public.products FOR DELETE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can view their own products"
ON public.products FOR SELECT
USING (auth.uid() = seller_id);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own cart"
ON public.cart_items FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can add to cart"
ON public.cart_items FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their cart"
ON public.cart_items FOR UPDATE
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can remove from cart"
ON public.cart_items FOR DELETE
USING (auth.uid() = customer_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered
  delivery_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = customer_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  seller_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their order items"
ON public.order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

CREATE POLICY "Customers can create order items"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

CREATE POLICY "Sellers can view order items for their products"
ON public.order_items FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can update order items status"
ON public.order_items FOR UPDATE
USING (auth.uid() = seller_id);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL, -- card, upi, cod
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own payments"
ON public.payments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid()));

CREATE POLICY "Customers can create payments"
ON public.payments FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid()));

CREATE POLICY "Customers can update their payments"
ON public.payments FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid()));

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Customers can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = customer_id);

-- Update profiles table to add name and address
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();