import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  conversationDisplayName,
  type ConversationSummary,
} from "@/hooks/useMessaging";
import { formatDistanceToNow, format, isToday } from "date-fns";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Send, ArrowLeft, Users, Plus, MessageCircle, Mic, Square, X, Smile } from "lucide-react";
import { LinkifyText } from "@/components/LinkifyText";
import { useRecruiterGate } from "@/hooks/useRecruiterGate";
import { RecruiterStatusNotice } from "@/components/RecruiterStatusNotice";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { stripMentionMarkup } from "@/lib/mentions";
import { NewChatModal } from "@/components/messages/NewChatModal";
import { GroupMembersSheet } from "@/components/messages/GroupMembersSheet";
import { EmojiReactionPicker } from "@/components/chat/EmojiReactionPicker";
import { AudioMessagePlayer } from "@/components/chat/AudioMessagePlayer";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

const formatMessageTime = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  return format(date, "M/d/yyyy, h:mm a");
};

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const Messages = () => {
  const { user } = useAuth();
  const { data: conversations = [] } = useConversations();
  const sendMessage = useSendMessage();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeConversationId = searchParams.get("id");

  const [messageText, setMessageText] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);

  const { isRecording, audioBlob, recordingTime, startRecording, stopRecording, resetRecording } = useVoiceRecorder();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const { data: messages = [] } = useConversationMessages(activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConversationId) return;
    const textToSend = messageText;
    setMessageText("");
    await sendMessage.mutateAsync({
      conversationId: activeConversationId,
      content: textToSend,
    });
  };

  const handleSendVoiceNote = async () => {
    if (!audioBlob || !activeConversationId || !user) return;
    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from("voice_notes")
        .upload(fileName, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("voice_notes")
        .getPublicUrl(fileName);

      await sendMessage.mutateAsync({
        conversationId: activeConversationId,
        content: "Voice note",
        mediaUrl: publicUrl,
        mediaType: "audio",
      });
      resetRecording();
    } catch (err) {
      console.error("Error sending voice note:", err);
    }
  };

  return (
    <div className="container max-w-6xl py-6 h-[calc(100vh-4rem)]">
      <RecruiterStatusNotice />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full border rounded-lg overflow-hidden bg-background">
        <div className="md:col-span-1 border-r flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </h1>
            <Button size="icon" variant="ghost" onClick={() => setIsNewChatOpen(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSearchParams({ id: conv.id })}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                    activeConversationId === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conv.avatar_url || ""} />
                    <AvatarFallback>{getInitials(conversationDisplayName(conv, user?.id))}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversationDisplayName(conv, user?.id)}</p>
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="md:col-span-2 flex flex-col h-full">
          {activeConversation ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSearchParams({})}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={activeConversation.avatar_url || ""} />
                    <AvatarFallback>{getInitials(conversationDisplayName(activeConversation, user?.id))}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{conversationDisplayName(activeConversation, user?.id)}</h2>
                    {activeConversation.is_group && (
                      <p className="text-xs text-muted-foreground">Group Chat</p>
                    )}
                  </div>
                </div>
                {activeConversation.is_group && (
                  <Button variant="ghost" size="icon" onClick={() => setIsGroupSheetOpen(true)}>
                    <Users className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isSender = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 relative group ${
                            isSender
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.media_type === "audio" || msg.media_type === "voice" ? (
                            <AudioMessagePlayer audioUrl={msg.media_url || ""} />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">
                              <LinkifyText text={stripMentionMarkup(msg.content)} />
                            </p>
                          )}
                          <span className="text-[10px] opacity-70 mt-1 block text-right">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          <div className="mt-1 flex items-center gap-1">
                            <EmojiReactionPicker />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                {isRecording ? (
                  <div className="flex items-center gap-3 bg-muted p-2 rounded-md">
                    <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium">Recording: {recordingTime}s</span>
                    <div className="ml-auto flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={resetRecording}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button variant="outline" size="sm" onClick={stopRecording}>
                        <Square className="h-4 w-4 mr-1" /> Stop
                      </Button>
                      <Button size="sm" onClick={handleSendVoiceNote}>
                        <Send className="h-4 w-4 mr-1" /> Send Voice
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MentionTextarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="min-h-[40px] max-h-[120px]"
                    />
                    <Button variant="outline" size="icon" onClick={startRecording} title="Record Voice Note">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSend} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>

      <NewChatModal open={isNewChatOpen} onOpenChange={setIsNewChatOpen} />
      {activeConversation && (
        <GroupMembersSheet
          open={isGroupSheetOpen}
          onOpenChange={setIsGroupSheetOpen}
          conversationId={activeConversation.id}
        />
      )}
    </div>
  );
};

export default Messages;
