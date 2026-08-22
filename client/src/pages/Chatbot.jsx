import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useSearchParams, Link } from 'react-router-dom';
import { chatApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';

export default function Chatbot() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(() => searchParams.get('session') || crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load session from URL param on mount
  useEffect(() => {
    const sid = searchParams.get('session');
    if (sid) {
      setSessionId(sid);
      chatApi.getSession(sid)
        .then((res) => {
          setMessages(res.data?.chat?.messages || []);
        })
        .catch(() => {});
    }
    // Load sidebar sessions list
    chatApi.listSessions()
      .then((res) => setSessions(res.data?.sessions || []))
      .catch(() => {});
  }, []);

  const handleStartNewSession = () => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    setMessages([]);
    setError('');
    setSearchParams({});
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          setLoading(true);
          const res = await chatApi.transcribeVoice(audioBlob);
          if (res.data?.text) {
            setInputMessage((prev) => (prev ? prev + ' ' + res.data.text : res.data.text));
          }
        } catch (err) {
          setError('Failed to transcribe voice.');
        } finally {
          setLoading(false);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied or not available.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setError('');

    // Append user message immediately
    const userMsgObj = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setLoading(true);

    try {
      const res = await chatApi.send({
        message: userText,
        sessionId,
        language,
      });

      const assistantMsg = res.data?.message;
      if (assistantMsg) {
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setError(err.message || 'Failed to get response from AI Legal Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    {
      en: 'What are my rights if my landlord does not refund my security deposit?',
      hi: 'अगर मकान मालिक सिक्योरिटी डिपॉजिट वापस न करे तो किरायेदार के क्या अधिकार हैं?',
    },
    {
      en: 'How do I file an RTI application under the RTI Act, 2005?',
      hi: 'RTI Act 2005 के तहत सूचना का अधिकार आवेदन कैसे दाखिल करें?',
    },
    {
      en: 'What can I do if a shopkeeper sells me a defective product?',
      hi: 'उपभोक्ता संरक्षण कानून के तहत खराब सामान मिलने पर क्या करें?',
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-10rem)]">

        {/* Sessions Sidebar */}
        {showHistory && (
          <div className="w-72 flex-shrink-0 bg-[#111] border border-white/5 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">💬 Chat History</h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white text-lg leading-none transition-colors">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {sessions.length === 0 ? (
                <p className="p-4 text-xs text-gray-500">No previous sessions.</p>
              ) : sessions.map((s) => (
                <button
                  key={s.sessionId}
                  onClick={() => {
                    setSessionId(s.sessionId);
                    setSearchParams({ session: s.sessionId });
                    chatApi.getSession(s.sessionId)
                      .then((res) => setMessages(res.data?.chat?.messages || []))
                      .catch(() => {});
                    setShowHistory(false);
                  }}
                  className={`w-full text-left p-3 hover:bg-[#151515] transition-colors ${
                    s.sessionId === sessionId ? 'bg-[#0a0a0a] border-l-2 border-teal-500' : ''
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-300 line-clamp-2">{s.lastMessage || 'Conversation'}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(s.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {s.messageCount} msgs
                  </p>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-white/5">
              <button
                onClick={handleStartNewSession}
                className="w-full text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 px-3 py-2 rounded-lg transition-colors"
              >
                + New Conversation
              </button>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 space-y-4 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="bg-[#111] p-4 rounded-2xl border border-white/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
              className="w-9 h-9 rounded-xl bg-[#0a0a0a] hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 hover:border-teal-500/30 flex items-center justify-center text-base transition-colors border border-white/10"
            >
              🕐
            </button>
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              ⚖️
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{t('chatTitle')}</h1>
              <p className="text-xs text-gray-400">{t('chatSubtitle')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartNewSession}
            className="text-xs font-bold text-gray-400 hover:text-red-400 bg-[#0a0a0a] hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            🔄 {t('chatClear')}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 bg-[#111] rounded-2xl border border-white/5 shadow-sm p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                🇮🇳
              </div>
              <h3 className="text-base font-bold text-white">
                {language === 'hi'
                  ? 'नमस्ते! आप भारतीय कानून से जुड़ा कोई भी सवाल पूछ सकते हैं।'
                  : 'Welcome! Ask any question regarding Indian law.'}
              </h3>
              <p className="text-xs text-gray-400">
                {language === 'hi'
                  ? 'NYAYA 3 भागों में उत्तर देगा: कानूनी नियम, आसान व्याख्या, और आगे क्या करना है।'
                  : 'NYAYA provides answers structured in 3 clear sections: Legal Answer, Simple Terms, and What To Do Next.'}
              </p>

              <div className="pt-2 text-left space-y-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
                  {language === 'hi' ? 'सुझाए गए प्रश्न' : 'Suggested Questions'}
                </div>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputMessage(language === 'hi' ? q.hi : q.en)}
                    className="w-full text-left text-xs bg-[#0a0a0a] hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/30 p-2.5 rounded-xl text-gray-300 transition-colors shadow-inner"
                  >
                    💬 {language === 'hi' ? q.hi : q.en}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm ${
                      isUser
                        ? 'bg-teal-500/20 text-teal-100 border border-teal-500/30 rounded-br-none shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                        : 'bg-[#0a0a0a] text-gray-300 border border-white/5 rounded-bl-none shadow-inner'
                    }`}
                  >
                    <div className={`text-[10px] font-bold mb-2 ${isUser ? 'text-teal-400' : 'text-gray-500'}`}>
                      {isUser ? 'You' : 'NYAYA AI Assistant'}
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed font-sans font-normal">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl rounded-bl-none p-4 max-w-md shadow-inner flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
                <span className="text-xs text-gray-400 font-medium">{t('chatSending')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <input
            type="text"
            required={!isRecording && !inputMessage.trim()}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 px-4 py-3 bg-[#0a0a0a] rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
          />
          <button
            type="button"
            onClick={handleToggleRecording}
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center border ${
              isRecording 
                ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                : 'bg-[#111] hover:bg-[#151515] border-white/10 text-teal-400 hover:text-teal-300 hover:border-teal-500/30 hover:bg-teal-500/10'
            }`}
            title={isRecording ? "Stop Recording" : "Voice to Text"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path 
                d="M2 12c3.5-3.5 7.5-4.5 10-4.5 2.5 0 6.5 1 10 4.5-3.5 3.5-7.5 4.5-10 4.5-2.5 0-6.5-1-10-4.5z" 
                className={`transition-all duration-300 origin-center ${isRecording ? 'animate-pulse scale-y-125 fill-red-500/30' : 'scale-y-100'}`} 
              />
              <path 
                d="M2 12c3.5 1.5 7.5 2 10 2 2.5 0 6.5-0.5 10-2" 
                className={`transition-all duration-300 ${isRecording ? 'opacity-0' : 'opacity-100'}`} 
              />
            </svg>
          </button>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all disabled:opacity-50 text-sm flex items-center justify-center"
          >
            {t('chatSend')}
          </button>
        </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
