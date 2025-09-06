-- Add ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for ratings
CREATE POLICY "Users can view ratings for their orders" ON public.ratings
FOR SELECT
USING (auth.uid() = customer_id OR auth.uid() = driver_id);

CREATE POLICY "Customers can create ratings" ON public.ratings
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own ratings" ON public.ratings
FOR UPDATE
USING (auth.uid() = customer_id);

-- Add payment integration fields to orders
ALTER TABLE public.orders 
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_reference TEXT,
ADD COLUMN total_amount NUMERIC;

-- Add admin role to user_role enum
ALTER TYPE public.user_role ADD VALUE 'admin';

-- Create function to calculate driver ratings
CREATE OR REPLACE FUNCTION public.calculate_driver_rating(driver_user_id UUID)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(rating), 0.0)
  FROM public.ratings
  WHERE driver_id = driver_user_id;
$$;

-- Add trigger to update driver rating when new rating is added
CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.driver_profiles
  SET rating = public.calculate_driver_rating(NEW.driver_id),
      updated_at = NOW()
  WHERE id = NEW.driver_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_driver_rating_trigger
AFTER INSERT OR UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_driver_rating();