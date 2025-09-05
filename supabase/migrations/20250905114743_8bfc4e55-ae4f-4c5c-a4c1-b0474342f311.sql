-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION generate_tracking_code() RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'FKS' || UPPER(substr(md5(random()::text), 1, 8));
END;
$$;

CREATE OR REPLACE FUNCTION generate_confirmation_code() RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN UPPER(substr(md5(random()::text), 1, 6));
END;
$$;

CREATE OR REPLACE FUNCTION set_order_codes() RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := generate_tracking_code();
  END IF;
  IF NEW.confirmation_code IS NULL THEN
    NEW.confirmation_code := generate_confirmation_code();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;