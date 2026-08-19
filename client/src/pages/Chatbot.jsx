import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { chatApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';

export default function Chatbot() {
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleStartNewSession = () => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setError('');
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
      <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
        {/* Chat Header */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nyaya-navy text-nyaya-gold flex items-center justify-center text-xl font-bold">
              ⚖️
            </div>
            <div>
              <h1 className="text-base font-bold text-nyaya-navy">{t('chatTitle')}</h1>
              <p className="text-xs text-gray-500">{t('chatSubtitle')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartNewSession}
            className="text-xs font-bold text-nyaya-navy bg-nyaya-light hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
          >
            🔄 {t('chatClear')}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 bg-nyaya-light rounded-2xl flex items-center justify-center text-3xl mx-auto border border-gray-100 shadow-xs">
                🇮🇳
              </div>
              <h3 className="text-base font-bold text-nyaya-navy">
                {language === 'hi'
                  ? 'नमस्ते! आप भारतीय कानून से जुड़ा कोई भी सवाल पूछ सकते हैं।'
                  : 'Welcome! Ask any question regarding Indian law.'}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'hi'
                  ? 'NYAYA 3 भागों में उत्तर देगा: कानूनी नियम, आसान व्याख्या, और आगे क्या करना है।'
                  : 'NYAYA provides answers structured in 3 clear sections: Legal Answer, Simple Terms, and What To Do Next.'}
              </p>

              <div className="pt-2 text-left space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  {language === 'hi' ? 'सुझाए गए प्रश्न' : 'Suggested Questions'}
                </div>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputMessage(language === 'hi' ? q.hi : q.en)}
                    className="w-full text-left text-xs bg-gray-50 hover:bg-amber-50/70 border border-gray-200/80 hover:border-amber-200 p-2.5 rounded-xl text-gray-700 transition-colors"
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
                        ? 'bg-nyaya-navy text-white rounded-br-none shadow-sm'
                        : 'bg-gray-50 text-gray-900 border border-gray-200/80 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-60 mb-1">
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
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-none p-4 max-w-md shadow-xs flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-nyaya-navy/30 border-t-nyaya-navy rounded-full animate-spin" />
                <span className="text-xs text-gray-600 font-medium">{t('chatSending')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            required
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-3 bg-nyaya-navy hover:bg-nyaya-blue text-white font-bold rounded-xl shadow transition-colors disabled:opacity-50 text-sm"
          >
            {t('chatSend')}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
