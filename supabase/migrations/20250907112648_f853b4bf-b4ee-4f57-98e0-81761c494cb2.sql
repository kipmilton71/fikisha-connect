-- Create driver_applications table to store comprehensive application data
CREATE TABLE public.driver_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_type TEXT NOT NULL,
  vehicle_types TEXT[] NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  language_preference TEXT,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  referral_code TEXT,
  company_name TEXT,
  company_registration_number TEXT,
  number_of_drivers TEXT,
  vehicles JSONB NOT NULL DEFAULT '[]'::jsonb,
  billing_type TEXT NOT NULL,
  mpesa_account_name TEXT NOT NULL,
  mpesa_phone_number TEXT NOT NULL,
  physical_address TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  application_status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own driver application" 
ON public.driver_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own driver application" 
ON public.driver_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all driver applications" 
ON public.driver_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update driver applications" 
ON public.driver_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_driver_applications_updated_at
BEFORE UPDATE ON public.driver_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();