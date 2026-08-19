# NYAYA Phase 3A: Node.js Backend Tasks

- [ ] Initialize Node.js project in `server/` directory
- [ ] Install dependencies (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `axios`, `cors`, `dotenv`)
- [ ] Setup `server/.env`
- [ ] **Database Layer**
  - [ ] `config/db.js`
  - [ ] `models/User.js`
  - [ ] `models/Grievance.js`
- [ ] **AI Integration Layer**
  - [ ] `services/aiBridge.js` (Axios client to talk to FastAPI `localhost:8000`)
- [ ] **Controllers & Routes**
  - [ ] `controllers/authController.js` & `routes/authRoutes.js`
  - [ ] `controllers/grievanceController.js` & `routes/grievanceRoutes.js`
  - [ ] `middleware/authMiddleware.js`
- [ ] **Entry Point**
  - [ ] `server.js`
- [ ] Test Node.js API with Postman/cURL
