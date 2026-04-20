import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { GlassCard } from '@/components/GlassCard'
import { api } from '@/lib/api'

type Mode = 'chat' | 'opis' | 'support' | 'naprawa'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const MODE_OPTIONS: { key: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'chat', label: 'Czat AI', icon: 'chatbubble-ellipses-outline' },
  { key: 'opis', label: 'Opis produktu', icon: 'document-text-outline' },
  { key: 'support', label: 'Obsługa klienta', icon: 'heart-circle-outline' },
  { key: 'naprawa', label: 'Naprawa', icon: 'build-outline' },
]

export default function AIScreen() {
  const [mode, setMode] = useState<Mode>('chat')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Witaj w mobilnym Panelu AI. Mogę pomóc w opisach produktów, odpowiedziach dla klientów i diagnozie problemów.',
    },
  ])
  const [opisForm, setOpisForm] = useState({ name: '', category: '', keywords: '' })
  const [supportForm, setSupportForm] = useState({ customer_message: '', order_status: '', context: '' })
  const [repairForm, setRepairForm] = useState({ area: '', symptoms: '', code_snippet: '' })
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const helperText = useMemo(() => {
    switch (mode) {
      case 'opis':
        return 'Dodaj nazwę produktu i kontekst, a AI przygotuje gotowy opis sprzedażowy.'
      case 'support':
        return 'Wklej wiadomość klienta i status zamówienia, aby dostać gotową odpowiedź.'
      case 'naprawa':
        return 'Opisz błąd UI, brakujący import lub niedziałającą akcję.'
      default:
        return 'Zadaj pytanie o sklep, marketplace, feed hurtowni albo support.'
    }
  }, [mode])

  async function sendChat() {
    if (!chatInput.trim()) return
    const userMessage = { id: `${Date.now()}`, role: 'user' as const, content: chatInput.trim() }
    setMessages((prev) => [...prev, userMessage])
    setChatInput('')
    setLoading(true)
    setError('')

    try {
      const response = await api.ai.chat({
        message: userMessage.content,
        conversation_id: conversationId,
        context_type: 'general',
      }) as { conversationId?: string; message?: { content?: string } }

      if (response?.conversationId) setConversationId(response.conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response?.message?.content || 'Brak odpowiedzi od AI.',
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wysłać wiadomości.')
    } finally {
      setLoading(false)
    }
  }

  async function runGenerator() {
    setLoading(true)
    setError('')
    setResult('')

    try {
      if (mode === 'opis') {
        const response = await api.ai.generateProductDescription({ ...opisForm, language: 'pl' }) as { description?: string }
        setResult(response?.description || JSON.stringify(response, null, 2))
      }

      if (mode === 'support') {
        const response = await api.ai.supportChat({ ...supportForm, tone: 'empatyczny' }) as { reply?: string; faqHint?: string; recommendedStatus?: string }
        setResult([response?.reply, response?.recommendedStatus ? `Status: ${response.recommendedStatus}` : '', response?.faqHint ? `FAQ: ${response.faqHint}` : ''].filter(Boolean).join('\n\n'))
      }

      if (mode === 'naprawa') {
        const response = await api.ai.repairHelper(repairForm) as { diagnosis?: string; fixes?: string[]; warning?: string }
        setResult([
          response?.diagnosis || '',
          Array.isArray(response?.fixes) && response.fixes.length ? `Kroki naprawy:\n- ${response.fixes.join('\n- ')}` : '',
          response?.warning ? `Uwaga: ${response.warning}` : '',
        ].filter(Boolean).join('\n\n'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wygenerować odpowiedzi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.hero} padding={18}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name="sparkles-outline" size={24} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Panel AI</Text>
              <Text style={styles.heroSubtitle}>Mobilny asystent marketplace dla sprzedawcy i operatora</Text>
            </View>
          </View>
          <Text style={styles.helperText}>{helperText}</Text>
        </GlassCard>

        <View style={styles.modeRow}>
          {MODE_OPTIONS.map((option) => {
            const active = mode === option.key
            return (
              <TouchableOpacity key={option.key} style={[styles.modeChip, active && styles.modeChipActive]} onPress={() => { setMode(option.key); setResult(''); setError('') }}>
                <Ionicons name={option.icon} size={16} color={active ? '#000' : Colors.textSecondary} />
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {mode === 'chat' ? (
          <GlassCard padding={16}>
            <View style={styles.chatList}>
              {messages.map((message) => (
                <View key={message.id} style={[styles.bubbleRow, message.role === 'user' ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
                  <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                    <Text style={styles.bubbleText}>{message.content}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Napisz do AI…"
                placeholderTextColor={Colors.textMuted}
                style={styles.textInput}
                multiline
              />
              <TouchableOpacity style={styles.primaryButton} onPress={sendChat} disabled={loading || !chatInput.trim()}>
                {loading ? <ActivityIndicator color="#000" /> : <Ionicons name="send" size={18} color="#000" />}
              </TouchableOpacity>
            </View>
          </GlassCard>
        ) : null}

        {mode === 'opis' ? (
          <GlassCard padding={16}>
            <Text style={styles.sectionTitle}>Generator opisu produktu</Text>
            <TextInput value={opisForm.name} onChangeText={(value) => setOpisForm((prev) => ({ ...prev, name: value }))} placeholder="Nazwa produktu" placeholderTextColor={Colors.textMuted} style={styles.textInput} />
            <TextInput value={opisForm.category} onChangeText={(value) => setOpisForm((prev) => ({ ...prev, category: value }))} placeholder="Kategoria" placeholderTextColor={Colors.textMuted} style={styles.textInput} />
            <TextInput value={opisForm.keywords} onChangeText={(value) => setOpisForm((prev) => ({ ...prev, keywords: value }))} placeholder="Słowa kluczowe" placeholderTextColor={Colors.textMuted} style={styles.textInput} />
            <TouchableOpacity style={styles.fullButton} onPress={runGenerator} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.fullButtonText}>Generuj opis</Text>}
            </TouchableOpacity>
          </GlassCard>
        ) : null}

        {mode === 'support' ? (
          <GlassCard padding={16}>
            <Text style={styles.sectionTitle}>Odpowiedź dla klienta</Text>
            <TextInput value={supportForm.customer_message} onChangeText={(value) => setSupportForm((prev) => ({ ...prev, customer_message: value }))} placeholder="Wiadomość klienta" placeholderTextColor={Colors.textMuted} style={[styles.textInput, styles.textarea]} multiline />
            <TextInput value={supportForm.order_status} onChangeText={(value) => setSupportForm((prev) => ({ ...prev, order_status: value }))} placeholder="Status zamówienia" placeholderTextColor={Colors.textMuted} style={styles.textInput} />
            <TextInput value={supportForm.context} onChangeText={(value) => setSupportForm((prev) => ({ ...prev, context: value }))} placeholder="Dodatkowy kontekst" placeholderTextColor={Colors.textMuted} style={[styles.textInput, styles.textarea]} multiline />
            <TouchableOpacity style={styles.fullButton} onPress={runGenerator} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.fullButtonText}>Generuj odpowiedź</Text>}
            </TouchableOpacity>
          </GlassCard>
        ) : null}

        {mode === 'naprawa' ? (
          <GlassCard padding={16}>
            <Text style={styles.sectionTitle}>Pomoc naprawcza</Text>
            <TextInput value={repairForm.area} onChangeText={(value) => setRepairForm((prev) => ({ ...prev, area: value }))} placeholder="Obszar problemu" placeholderTextColor={Colors.textMuted} style={styles.textInput} />
            <TextInput value={repairForm.symptoms} onChangeText={(value) => setRepairForm((prev) => ({ ...prev, symptoms: value }))} placeholder="Objawy" placeholderTextColor={Colors.textMuted} style={[styles.textInput, styles.textarea]} multiline />
            <TextInput value={repairForm.code_snippet} onChangeText={(value) => setRepairForm((prev) => ({ ...prev, code_snippet: value }))} placeholder="Fragment kodu (opcjonalnie)" placeholderTextColor={Colors.textMuted} style={[styles.textInput, styles.textarea]} multiline />
            <TouchableOpacity style={styles.fullButton} onPress={runGenerator} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.fullButtonText}>Analizuj problem</Text>}
            </TouchableOpacity>
          </GlassCard>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <GlassCard padding={16}>
            <Text style={styles.sectionTitle}>Wynik</Text>
            <Text style={styles.resultText}>{result}</Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 14 },
  hero: { borderColor: 'rgba(124,58,237,0.25)', backgroundColor: 'rgba(124,58,237,0.06)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.neonViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  heroSubtitle: { color: Colors.textSecondary, fontSize: 13 },
  helperText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modeChipActive: { backgroundColor: Colors.neonCyan, borderColor: Colors.neonCyan },
  modeChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  modeChipTextActive: { color: '#000' },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  chatList: { gap: 10, marginBottom: 14 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  aiBubble: { backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.border },
  userBubble: { backgroundColor: Colors.neonViolet },
  bubbleText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  inputGroup: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    color: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  primaryButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fullButton: {
    backgroundColor: Colors.neonCyan,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButtonText: { color: '#000', fontWeight: '800', fontSize: 15 },
  errorBox: { borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)', padding: 14 },
  errorText: { color: '#fecaca', fontSize: 13 },
  resultText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
})
