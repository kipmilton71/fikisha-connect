import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface OrderChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  otherParty: {
    id: string;
    name: string;
    phone: string;
  };
}

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

const OrderChatDialog: React.FC<OrderChatDialogProps> = ({ 
  open, 
  onOpenChange, 
  order, 
  otherParty 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && order?.id) {
      loadMessages();
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel(`order-chat-${order.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${order.id}`
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            setMessages(prev => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, order?.id]);

  const loadMessages = async () => {
    if (!order?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !order?.id) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          order_id: order.id,
          sender_id: user.id,
          receiver_id: otherParty.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Chat - Order {order?.tracking_code}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Chatting with {otherParty.name}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`tel:${otherParty.phone}`)}
            >
              <Phone className="h-4 w-4 mr-2" />
              {otherParty.phone}
            </Button>
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/5">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender_id === user?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {message.sender_id === user?.id ? 'You' : otherParty.name}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderChatDialog;