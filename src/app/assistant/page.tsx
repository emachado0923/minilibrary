'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, User, Loader2, BookOpen, BarChart3, Search, AlertCircle, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  intent?: string
}

const SUGGESTIONS = [
  { icon: <Search className="h-4 w-4" />, text: 'Is "1984" available?', label: 'Availability' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Books by J.R.R. Tolkien', label: 'By author' },
  { icon: <BarChart3 className="h-4 w-4" />, text: 'How many books in total?', label: 'Statistics' },
  { icon: <AlertCircle className="h-4 w-4" />, text: 'Any overdue loans?', label: 'Overdue' },
  { icon: <Sparkles className="h-4 w-4" />, text: 'What Fantasy books do you have?', label: 'By genre' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Most popular books?', label: 'Popular' },
]

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 ¡Hola! Soy el **Asistente Virtual** de la biblioteca.\n\nPuedo ayudarte con:\n• 📖 Buscar libros por título, autor o categoría\n• ✅ Verificar disponibilidad en tiempo real\n• 📋 Consultar préstamos activos y vencidos\n• 📊 Ver estadísticas de la biblioteca\n• 🔥 Descubrir los libros más populares\n\n¿En qué puedo ayudarte?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content, intent: data.intent },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Error de conexión. Intenta de nuevo.' },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Real-time database queries</p>
          </div>
          <Badge variant="outline" className="ml-auto text-green-600 border-green-600">
            ● Online
          </Badge>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-muted">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bot className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">Hello! I'm your library assistant</h2>
                <p className="text-muted-foreground mb-6">
                  I can help you search books, check availability, review loans and more.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-2xl">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion.text)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left bg-card"
                    >
                      {suggestion.icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{suggestion.label}</p>
                        <p className="text-sm truncate font-medium">{suggestion.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-card border border-border shadow-sm rounded-tl-sm text-foreground'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                      {msg.intent && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <Badge variant="secondary" className="text-xs">
                            {msg.intent.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Querying database...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {messages.length === 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Try asking:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-2 text-left text-xs p-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
                  >
                    <span className="text-primary">{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Real-time queries against the library database
            </p>
          </div>
        </Card>
    </div>
  )
}
