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
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const chatColumnRef = useRef<HTMLElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [composerFocused, setComposerFocused] = useState(false);
  const [keyboardFrame, setKeyboardFrame] = useState<{
    top: number; left: number; width: number; height: number;
  } | null>(null);
  const restingViewportHeight = useRef(0);
  const restingViewportWidth = useRef(0);
  const scrollFrame = useRef<number | null>(null);

  const scrollMessagesToBottom = () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      const viewport = messageListRef.current?.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
      scrollFrame.current = null;
    });
  };

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const { data: messages = [] } = useConversationMessages(activeConversationId);

  const threadOpen = !!activeConversationId || !!pendingRecipientId;

  useEffect(() => {
    restingViewportHeight.current = window.innerHeight;
    restingViewportWidth.current = window.innerWidth;
    return () => {
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
      delete document.documentElement.dataset.chatKeyboardOpen;
    };
  }, []);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [messages, activeConversationId, pendingRecipientId]);

  useEffect(() => {
    if (!composerFocused || !threadOpen) {
      delete document.documentElement.dataset.chatKeyboardOpen;
      setKeyboardFrame(null);
      return;
    }

    const updateFrame = () => {
      if (restingViewportWidth.current !== window.innerWidth) {
        restingViewportWidth.current = window.innerWidth;
        restingViewportHeight.current = window.innerHeight;
      }
      if (window.innerWidth >= 768) {
        delete document.documentElement.dataset.chatKeyboardOpen;
        setKeyboardFrame(null);
        return;
      }
      const visual = window.visualViewport;
      const visibleHeight = visual?.height ?? window.innerHeight;
      // Toolbar changes are small; require an actual keyboard-sized reduction.
      const keyboardOpen = restingViewportHeight.current - visibleHeight > 120 && (visual?.scale ?? 1) <= 1.05;
      if (!keyboardOpen) {
        if (window.innerHeight > restingViewportHeight.current) restingViewportHeight.current = window.innerHeight;
        delete document.documentElement.dataset.chatKeyboardOpen;
        setKeyboardFrame(null);
        return;
      }

      const column = chatColumnRef.current?.getBoundingClientRect();
      const navbar = document.querySelector("header.sticky")?.getBoundingClientRect();
      if (!column) return;
      const top = Math.max(visual?.offsetTop ?? 0, navbar?.bottom ?? 0, column.top);
      const bottom = (visual?.offsetTop ?? 0) + visibleHeight;
      document.documentElement.dataset.chatKeyboardOpen = "true";
      setKeyboardFrame({ top, left: column.left, width: column.width, height: Math.max(0, bottom - top) });
      scrollMessagesToBottom();
    };

    updateFrame();
    window.visualViewport?.addEventListener("resize", updateFrame);
    window.visualViewport?.addEventListener("scroll", updateFrame);
    window.addEventListener("resize", updateFrame);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateFrame);
      window.visualViewport?.removeEventListener("scroll", updateFrame);
      window.removeEventListener("resize", updateFrame);
      delete document.documentElement.dataset.chatKeyboardOpen;
    };
  }, [composerFocused, threadOpen]);

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
  const closeThread = () => {
    setComposerFocused(false);
    setActiveConversationId(null);
    setPendingRecipientId(null);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("conversationId");
      params.delete("recipientId");
      return params;
    });
  };

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const composer = (
    <div className={`shrink-0 border-t px-4 pt-4 ${keyboardFrame ? "pb-2" : "pb-[max(1rem,env(safe-area-inset-bottom))]"} md:pb-4`}>
      {gate.restricted ? (
        <RecruiterStatusNotice
          status={gate.status}
          action="message members"
          className="border-0 shadow-none"
        />
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <MentionTextarea
              placeholder="Type a message... Use @ to tag someone"
              value={messageText}
              onValueChange={setMessageText}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setComposerFocused(true);
                scrollMessagesToBottom();
              }}
              onBlur={() => setComposerFocused(false)}
              className="min-h-[44px] max-h-32 resize-none max-md:!text-base md:text-sm"
              rows={1}
            />
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left: Recent Chats */}
        <aside className={`lg:col-span-4 ${threadOpen ? "hidden lg:block" : "block"}`}>
          <Card className="h-[calc(100dvh-12rem)] md:h-[calc(100dvh-8rem)]">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <h3 className="font-semibold">Recent Chats</h3>
              <Button size="sm" variant="outline" onClick={() => setNewChatOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New
              </Button>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-4.5rem)]">
              <CardContent className="p-2">
                {conversations.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No chats yet. Tap New to message a connection or start a group.
                  </p>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      className={`w-full rounded-lg text-left transition-colors ${
                        activeConversationId === c.id ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                      onClick={() => openConversation(c.id)}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              (c.is_group ? c.avatar_url : c.counterpart_profile?.avatar_url) ||
                              undefined
                            }
                          />
                          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                            {c.is_group ? (
                              <Users className="h-4 w-4" />
                            ) : (
                              getInitials(c.counterpart_profile?.full_name)
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {conversationDisplayName(c)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.last_message?.content
                              ? stripMentionMarkup(c.last_message.content)
                              : c.is_group
                                ? `${c.participants.length} members`
                                : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-xs text-muted-foreground">
                          {c.last_message?.created_at &&
                            formatDistanceToNow(new Date(c.last_message.created_at), {
                              addSuffix: false,
                            })}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </aside>

        {/* Right: Chat Area */}
        <main ref={chatColumnRef} className={`lg:col-span-8 ${threadOpen ? "block" : "hidden lg:block"}`}>
          <Card
            className={`flex h-[calc(100dvh-12rem)] flex-col md:h-[calc(100dvh-8rem)] ${keyboardFrame ? "z-40 overflow-hidden" : ""}`}
            style={keyboardFrame ? { position: "fixed", top: keyboardFrame.top, left: keyboardFrame.left, width: keyboardFrame.width, height: keyboardFrame.height } : undefined}
          >
            {threadOpen ? (
              <>
                <CardHeader className="flex flex-row items-center gap-2 border-b py-3">
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
                <ScrollArea ref={messageListRef} className="min-h-0 flex-1 p-4">
                  {messagesLoading && activeConversationId ? (
                    <p className="py-8 text-center text-muted-foreground">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No messages yet. Send a message to start the conversation!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        const showSender = !!activeConversation?.is_group && !isOwn;
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            {showSender && (
                              <Link to={`/profile?userId=${msg.sender_id}`} className="shrink-0">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.sender_profile?.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                                    {getInitials(msg.sender_profile?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            )}
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {showSender && (
                                <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                                  {msg.sender_profile?.full_name || "Unknown"}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap break-words text-sm">
                                <LinkifyText>{msg.content}</LinkifyText>
                              </p>
                              <p
                                className={`mt-1 text-xs ${
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {formatMessageTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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
