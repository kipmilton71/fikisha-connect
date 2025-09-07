-- Add new columns to orders table for enhanced package details
ALTER TABLE public.orders 
ADD COLUMN product_category text,
ADD COLUMN product_value numeric,
ADD COLUMN product_weight numeric;

-- Create chat messages table for driver-customer communication
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages
CREATE POLICY "Users can view messages for their orders" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = chat_messages.order_id 
    AND (orders.sender_id = auth.uid() OR orders.driver_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages for their orders" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = chat_messages.order_id 
    AND (orders.sender_id = auth.uid() OR orders.driver_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- Create index for better query performance
CREATE INDEX idx_chat_messages_order_id ON public.chat_messages(order_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Add updated_at trigger to chat_messages
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();