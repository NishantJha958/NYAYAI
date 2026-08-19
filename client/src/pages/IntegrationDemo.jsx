import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { grievanceApi, chatApi, legalApi } from '../services/api.js';
import DualPanelResult from '../components/grievance/DualPanelResult.jsx';

const CATEGORIES = [
  'Property / Rent',
  'Consumer',
  'Police / Criminal',
  'RTI',
  'Employment',
  'Government Services',
  'Family',
  'Other',
];

const SAMPLE_GRIEVANCE =
  'मेरे मकान मालिक ने 6 महीने से सिक्योरिटी डिपॉजिट वापस नहीं किया है, 50,000 रुपये थे।';

export default function IntegrationDemo() {
  const { user, login, register, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState('integration@nyaya.test');
  const [password, setPassword] = useState('test123456');
  const [name, setName] = useState('Integration User');

  const [plainText, setPlainText] = useState(SAMPLE_GRIEVANCE);
  const [category, setCategory] = useState('Property / Rent');
  const [grievance, setGrievance] = useState(null);
  const [grievanceLoading, setGrievanceLoading] = useState(false);
  const [error, setError] = useState('');

  const [chatMessage, setChatMessage] = useState('');
  const [chatReply, setChatReply] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(
    'What are my rights if my landlord refuses to return my deposit?'
  );
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleAuth = async (mode) => {
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register({ name, email, password, preferredLang: language });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrievance = async (e) => {
    e.preventDefault();
    setGrievanceLoading(true);
    setError('');
    setGrievance(null);
    try {
      const res = await grievanceApi.create({ plainText, category, language });
      setGrievance(res.data.grievance);
    } catch (err) {
      setError(err.message);
    } finally {
      setGrievanceLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    setChatLoading(true);
    setError('');
    try {
      const res = await chatApi.send({ message: chatMessage, language });
      setChatReply(res.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError('');
    try {
      const res = await legalApi.search({ query: searchQuery, language });
      setSearchResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-nyaya-light">
      <header className="bg-nyaya-navy text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="text-xl font-bold">
              NYAYA
            </Link>
            <span className="ml-2 text-xs bg-nyaya-gold/30 px-2 py-1 rounded">
              Integration Demo
            </span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-nyaya-navy rounded px-2 py-1 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Auth */}
        <section className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-nyaya-navy mb-4">1. Authentication</h2>
          {!isAuthenticated ? (
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded px-3 py-2"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 md:col-span-2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleAuth('register')}
                className="bg-nyaya-navy text-white py-2 rounded"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => handleAuth('login')}
                className="border border-nyaya-navy text-nyaya-navy py-2 rounded"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span>Signed in as {user.email}</span>
              <button type="button" onClick={logout} className="text-sm text-red-600">
                Logout
              </button>
            </div>
          )}
        </section>

        {isAuthenticated && (
          <>
            {/* Grievance */}
            <section className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-nyaya-navy mb-4">
                2. Grievance → Node → FastAPI → RAG
              </h2>
              <form onSubmit={handleGrievance} className="space-y-4">
                <select
                  className="w-full border rounded px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <textarea
                  className="w-full border rounded px-3 py-2 h-28"
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Describe your problem..."
                />
                <button
                  type="submit"
                  disabled={grievanceLoading}
                  className="bg-nyaya-navy text-white px-6 py-2 rounded disabled:opacity-50"
                >
                  {grievanceLoading ? t('loading') : t('submit')}
                </button>
              </form>
              <DualPanelResult
                grievance={grievance}
                labels={{
                  legalDraft: t('legalDraft'),
                  simpleExplanation: t('simpleExplanation'),
                  statutes: t('statutes'),
                }}
              />
            </section>

            {/* Chat */}
            <section className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-nyaya-navy mb-4">3. AI Chat</h2>
              <form onSubmit={handleChat} className="space-y-4">
                <input
                  className="w-full border rounded px-3 py-2"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a legal question..."
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-nyaya-navy text-white px-6 py-2 rounded disabled:opacity-50"
                >
                  {chatLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
              {chatReply && (
                <pre className="mt-4 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border">
                  {chatReply.content}
                </pre>
              )}
            </section>

            {/* Legal Search */}
            <section className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-nyaya-navy mb-4">4. Legal Search</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <input
                  className="w-full border rounded px-3 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-nyaya-navy text-white px-6 py-2 rounded disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
              {searchResults?.results?.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {searchResults.results.map((r, i) => (
                    <li key={i} className="text-sm border-l-4 border-nyaya-gold pl-3">
                      <strong>
                        {r.act} §{r.section}
                      </strong>{' '}
                      — {r.title}
                      <p className="text-gray-600">{r.relevance?.slice(0, 200)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
