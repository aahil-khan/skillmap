"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, User, Check, X, MessageSquare, Send, ArrowLeft } from "lucide-react"
import {
  getConnections,
  respondToConnectionRequest,
  getConnectionMessages,
  sendConnectionMessage,
  type ConnectionsResponse,
  type PeerConnectionWithProfile,
  type Message,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ConnectionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [connections, setConnections] = useState<ConnectionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedConnection, setSelectedConnection] = useState<PeerConnectionWithProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    // Check for tab query parameter
    const tab = searchParams.get('tab')
    if (tab === 'sent' || tab === 'requests' || tab === 'active') {
      setActiveTab(tab)
    }
    loadConnections()
  }, [searchParams])

  const loadConnections = async () => {
    setLoading(true)
    try {
      const data = await getConnections()
      setConnections(data)
    } catch (error: any) {
      console.error("Failed to load connections:", error)
      toast({
        title: "Failed to load connections",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (connectionId: string, action: 'accept' | 'decline') => {
    try {
      await respondToConnectionRequest(connectionId, action)
      toast({
        title: `Connection ${action}ed!`,
        description: action === 'accept' ? "You can now message each other!" : "Request declined.",
      })
      loadConnections() // Reload to update lists
    } catch (error: any) {
      toast({
        title: `Failed to ${action} connection`,
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadMessages = async (connection: PeerConnectionWithProfile) => {
    setSelectedConnection(connection)
    setLoadingMessages(true)
    try {
      const data = await getConnectionMessages(connection.id)
      console.log('[Connections] Loaded messages response:', data)
      
      // apiRequest already unwraps data.data, so data is { connection_id, messages, count }
      const messagesList = data.messages || []
      
      // Ensure messages is always an array with valid structure
      const validMessages = Array.isArray(messagesList) 
        ? messagesList.filter(msg => msg && msg.id && msg.sender_userid)
        : []
      
      console.log('[Connections] Valid messages count:', validMessages.length)
      setMessages(validMessages)
    } catch (error: any) {
      toast({
        title: "Failed to load messages",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConnection || !messageText.trim()) return

    setSending(true)
    try {
      const newMessage = await sendConnectionMessage(selectedConnection.id, messageText.trim())
      console.log('[Connections] Message sent:', newMessage)
      
      // Add the new message to the messages array
      if (newMessage && newMessage.id && newMessage.sender_userid) {
        setMessages([...messages, newMessage])
        console.log('[Connections] Added new message to state')
      } else {
        console.error('[Connections] Invalid message structure:', newMessage)
      }
      
      setMessageText("")
      toast({
        title: "Message sent!",
      })
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const getOtherProfile = (connection: PeerConnectionWithProfile) => {
    // Determine which profile to show based on who we are
    const userId = localStorage.getItem('user-id') // You should get this from auth context
    if (connection.sender_userid === userId) {
      return connection.receiver_profile
    }
    return connection.sender_profile
  }

  if (loading) {
    return (
      <div className="min-h-screen skillmap-bg flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#8b1538]" />
      </div>
    )
  }

  // If viewing messages
  if (selectedConnection) {
    const otherProfile = getOtherProfile(selectedConnection)
    
    return (
      <div className="min-h-screen skillmap-bg p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedConnection(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Connections
            </Button>
          </div>

          <Card className="border-2 border-cream-300">
            <CardHeader className="border-b border-cream-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8b1538] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{otherProfile?.display_name || "Unknown User"}</CardTitle>
                  <p className="text-sm text-gray-600">{otherProfile?.title}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-[500px] p-6">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8b1538]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .filter(msg => msg && msg.id && msg.sender_userid) // Filter out invalid messages
                      .map((msg) => {
                      const currentUserId = localStorage.getItem('user-id')
                      const isMe = msg.sender_userid === currentUserId
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isMe
                                ? "bg-[#8b1538] text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {!isMe && (
                              <p className="text-xs font-semibold mb-1">
                                {msg.sender_profile?.display_name}
                              </p>
                            )}
                            <p className="text-sm">{msg.message_text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isMe ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-cream-200">
                <div className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="bg-[#8b1538] hover:bg-[#7a1230]"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main connections list view
  return (
    <div className="min-h-screen skillmap-bg p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Connections</h1>
          <p className="text-gray-600">Manage your peer connections and messages</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="active">
              Active ({connections?.accepted.length || 0})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({connections?.pending_received.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({connections?.pending_sent.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Active Connections */}
          <TabsContent value="active">
            {connections?.accepted.length === 0 ? (
              <Card className="border-2 border-cream-300">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600 mb-4">No active connections yet</p>
                  <Button onClick={() => router.push('/dashboard/peer-matching')}>
                    Find Peers to Connect
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {connections?.accepted.map((conn) => {
                  const profile = getOtherProfile(conn)
                  return (
                    <Card key={conn.id} className="border-2 border-cream-300 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-12 h-12 bg-[#8b1538] rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900">{profile?.display_name}</h3>
                              <p className="text-sm text-[#8b1538]">{profile?.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{profile?.bio}</p>
                            </div>
                          </div>
                          {conn.unread_count > 0 && (
                            <Badge variant="destructive" className="flex-shrink-0">
                              {conn.unread_count} new
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{profile?.experience_level}</Badge>
                          <Badge variant="outline">{profile?.availability}</Badge>
                          <Badge className="bg-[#8b1538]/10 text-[#8b1538] border-[#8b1538]/20 capitalize">
                            {conn.connection_type?.replace('_', ' ')}
                          </Badge>
                        </div>

                        <Button
                          onClick={() => loadMessages(conn)}
                          className="w-full bg-[#8b1538] hover:bg-[#7a1230]"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Chat
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Received Requests */}
          <TabsContent value="requests">
            {connections?.pending_received.length === 0 ? (
              <Card className="border-2 border-cream-300">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {connections?.pending_received.map((conn) => {
                  const profile = conn.sender_profile
                  return (
                    <Card key={conn.id} className="border-2 border-cream-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-[#8b1538] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{profile?.display_name}</h3>
                            <p className="text-sm text-[#8b1538]">{profile?.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{profile?.bio}</p>
                          </div>
                        </div>

                        {conn.sender_message && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">"{conn.sender_message}"</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRespond(conn.id, 'accept')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRespond(conn.id, 'decline')}
                            variant="outline"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent">
            {connections?.pending_sent.length === 0 ? (
              <Card className="border-2 border-cream-300">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">No pending sent requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {connections?.pending_sent.map((conn) => {
                  const profile = conn.receiver_profile
                  return (
                    <Card key={conn.id} className="border-2 border-cream-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-[#8b1538] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{profile?.display_name}</h3>
                            <p className="text-sm text-[#8b1538]">{profile?.title}</p>
                            <Badge variant="outline" className="mt-2">
                              Waiting for response
                            </Badge>
                          </div>
                        </div>

                        {conn.sender_message && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Your message:</p>
                            <p className="text-sm text-gray-700">"{conn.sender_message}"</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
