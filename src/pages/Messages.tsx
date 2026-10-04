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
import { Send, ArrowLeft, Users, Plus, MessageCircle } from "lucide-react";
import { LinkifyText } from "@/components/LinkifyText";
import { useRecruiterGate } from "@/hooks/useRecruiterGate";
import { RecruiterStatusNotice } from "@/components/RecruiterStatusNotice";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { stripMentionMarkup } from "@/lib/mentions";
import { NewChatModal } from "@/components/messages/NewChatModal";
import { GroupMembersSheet } from "@/components/messages/GroupMembersSheet";

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
  const gate = useRecruiterGate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
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

  const activeConversation = useMemo<ConversationSummary | null>(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const { data: messages = [], isLoading: messagesLoading } =
    useConversationMessages(activeConversationId);

  // Profile for a brand-new direct chat that has no conversation yet
  const { data: pendingProfile } = useQuery({
    queryKey: ["profile", pendingRecipientId],
    enabled: !!pendingRecipientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", pendingRecipientId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Sync from URL params
  useEffect(() => {
    const cid = searchParams.get("conversationId");
    if (cid) {
      setActiveConversationId(cid);
      setPendingRecipientId(null);
      return;
    }

    const rid = searchParams.get("recipientId");
    if (!rid) return;

    const existing = conversations.find((c) => !c.is_group && c.counterpart_id === rid);
    if (existing) {
      setActiveConversationId(existing.id);
      setPendingRecipientId(null);
    } else {
      setActiveConversationId(null);
      setPendingRecipientId(rid);
    }
  }, [searchParams, conversations]);

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
      const top = Math.max(visual?.offsetTop ?? 0, navbar?.bottom ?? 0);
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

  const openConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setPendingRecipientId(null);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("recipientId");
      params.set("conversationId", conversationId);
      return params;
    });
  };

  const openDirect = (recipientId: string) => {
    const existing = conversations.find((c) => !c.is_group && c.counterpart_id === recipientId);
    if (existing) {
      openConversation(existing.id);
      return;
    }
    setActiveConversationId(null);
    setPendingRecipientId(recipientId);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("conversationId");
      params.set("recipientId", recipientId);
      return params;
    });
  };

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

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content) return;

    if (activeConversation?.is_group) {
      await sendMessage.mutateAsync({
        conversationId: activeConversation.id,
        content,
        isGroup: true,
      });
      setMessageText("");
      return;
    }

    const recipientId = activeConversation?.counterpart_id ?? pendingRecipientId;
    if (!recipientId) return;

    const result = await sendMessage.mutateAsync({ recipientId, content });
    setMessageText("");
    const conversationId = result?.[0]?.conversation_id;
    if (conversationId && !activeConversationId) openConversation(conversationId);
  };

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
          <Button
            onClick={() => void handleSend()}
            disabled={sendMessage.isPending || !messageText.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

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
                    className="-ml-2 h-9 w-9 lg:hidden"
                    onClick={closeThread}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  {activeConversation?.is_group ? (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activeConversation.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Users className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {activeConversation.title || "Group chat"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeConversation.participants.length} members
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
                        Members
                      </Button>
                    </>
                  ) : (
                    (() => {
                      const otherId =
                        activeConversation?.counterpart_id ?? pendingRecipientId ?? "";
                      const profile =
                        activeConversation?.counterpart_profile ?? pendingProfile ?? null;
                      return (
                        <>
                          <Link to={`/profile?userId=${otherId}`}>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                                {getInitials(profile?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <Link
                            to={`/profile?userId=${otherId}`}
                            className="truncate font-semibold hover:underline"
                          >
                            {profile?.full_name || "Loading..."}
                          </Link>
                        </>
                      );
                    })()
                  )}
                </CardHeader>

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
                  )}
                </ScrollArea>

                {composer}
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">No conversations open</p>
                    <p className="text-sm text-muted-foreground">
                      Message a connection one-on-one, or start a group chat.
                    </p>
                  </div>
                  <Button className="gap-2" onClick={() => setNewChatOpen(true)}>
                    <Plus className="h-4 w-4" /> Start a Chat
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      <NewChatModal
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onStartDirect={openDirect}
        onGroupCreated={openConversation}
      />

      {activeConversation?.is_group && (
        <GroupMembersSheet
          open={membersOpen}
          onOpenChange={setMembersOpen}
          conversation={activeConversation}
          onLeft={closeThread}
        />
      )}
    </div>
  );
};

export default Messages;
