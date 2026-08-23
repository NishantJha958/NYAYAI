<div align="center">
  
  # ⚖️ NYAYA
  
  **India's First AI-Powered Legal Rights & Drafting Platform**
  
  [![React](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-blue)](https://react.dev)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org)
  [![FastAPI](https://img.shields.io/badge/AI_Service-Python%20FastAPI-teal)](https://fastapi.tiangolo.com/)
  [![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)](https://mongodb.com)
  [![Redis](https://img.shields.io/badge/Cache-Redis-red)](https://redis.io)

</div>

<br />

Navigating the Indian legal system is complex, expensive, and time-consuming for the common citizen. **NYAYA** bridges this gap by democratizing access to justice. Built on a sophisticated Retrieval-Augmented Generation (RAG) pipeline, NYAYA provides hallucination-free legal guidance, plain-language explanations, and automated legal drafting—empowering ordinary citizens, tenants, and workers to assert their rights without needing immediate, costly legal counsel.

---

## 🌟 Key Features

*   **💬 RAG-Powered Legal Chatbot:** Ask legal questions in everyday language (English or Hindi). NYAYA responds in three clear, structured sections:
    1.  **Legal Rule:** The exact statute or law applicable (e.g., BNS, BSA, RTI, etc.).
    2.  **Plain Language Explanation:** What it means without the complex legal jargon.
    3.  **Actionable Next Steps:** Practical steps on what evidence to gather and where to file a complaint.
*   **🎤 Voice-to-Text Integration:** Don't want to type? Use the built-in microphone to narrate your grievance. Powered by Groq Whisper for hyper-fast and accurate speech-to-text.
*   **📎 Smart Document Upload & Drafting:** Upload your evidence (PDF, DOCX, TXT, or images). NYAYA analyzes the context and automatically drafts a formal, verified legal notice.
*   **📄 PDF Generation & Download:** Instantly download your generated legal notice as a professionally formatted PDF, ready to be sent or submitted to authorities.
*   **🗂️ User Dashboard & History:** Track all your past AI conversations and active legal drafts from a centralized, personalized dashboard.

## 🚀 Innovation: Why NYAYA is Different

Generic Large Language Models (LLMs) often hallucinate, which is incredibly dangerous in a legal context. NYAYA solves this through architectural innovation:

*   **Zero-Hallucination via Strict RAG:** NYAYA doesn't guess. It is hard-wired to a vector database containing authentic Indian Legal Texts (Bharatiya Nyaya Sanhita, Consumer Protection Act, State Rent Control Acts, etc.). If the answer isn't in the law, NYAYA won't invent one.
*   **Microservice Decoupling:** We completely separated the standard CRUD backend (Node.js) from the computationally heavy AI processing (Python/FastAPI). This ensures that heavy AI operations never block standard user requests.
*   **Contextual Memory:** The AI maintains session memory, allowing for multi-turn conversations so users can ask follow-up questions just like they would with a real paralegal.

## 📈 Architecture & Scalability

NYAYA is built for production and designed to scale to millions of users seamlessly:

1.  **Independent Scaling:** By utilizing a microservices architecture, the Node.js API Gateway and the Python AI Inference Engine can be scaled independently based on traffic bottlenecks.
2.  **Redis Caching Layer:** We implemented an aggressive Redis caching strategy. Repeated queries (e.g., "What are tenant rights?") are served from the cache in milliseconds without waking up the LLM, massively reducing API costs and latency.
3.  **Stateless AI:** The FastAPI service remains completely stateless. All session management and conversation history are managed by the Node.js backend and stored persistently in MongoDB.

---

## 🛠️ Tech Stack

**Frontend (Client)**
*   React.js (Vite)
*   Tailwind CSS (Custom animations and UI)
*   React Router (Navigation)

**Backend (API Gateway & DB)**
*   Node.js & Express.js
*   MongoDB (Mongoose) - User auth, Chat history, Grievance data
*   Redis - Semantic response caching and rate limiting
*   JWT Auth & Bcrypt

**AI Microservice (Inference & RAG)**
*   Python & FastAPI
*   ChromaDB / Vector Database
*   Groq API (Whisper STT & LLM Inference)
*   LangChain

---

## ⚙️ Local Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   MongoDB running locally or a MongoDB Atlas URI
*   Redis Server running on port 6379

### 1. Clone the Repository
```bash
git clone https://github.com/NishantJha958/NYAYA.git
cd NYAYA
```

### 2. Setup the AI Service (Python)
```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Add your Groq API Key
echo "GROQ_API_KEY=your_api_key_here" > .env

# Run the FastAPI server (Runs on port 8000)
python main.py
```

### 3. Setup the Backend (Node.js)
```bash
# Open a new terminal
cd backend/server
npm install

# Create a .env file with the following variables:
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/nyaya
# JWT_SECRET=your_super_secret_key
# AI_SERVICE_URL=http://localhost:8000

# Run the Express server
npm run dev
```

### 4. Setup the Frontend (React)
```bash
# Open a new terminal
cd client
npm install

# Run the Vite development server
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🗺️ Future Roadmap

*   **Multi-Lingual Voice Output (TTS):** Allowing the platform to read legal answers aloud for accessibility.
*   **Regional Language Expansion:** Extending beyond Hindi and English to support Marathi, Tamil, Bengali, and more.
*   **Lawyer Matchmaking:** Integrating an opt-in system to connect users with verified local pro-bono lawyers when cases escalate beyond AI assistance.
*   **Deadline Tracker:** Automated SMS/Email alerts for legal statute of limitations and court dates.

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
