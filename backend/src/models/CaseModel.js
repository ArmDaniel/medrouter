const db = require('../config/database');

const CaseModel = {
  async createTable() {
    const queryText = `
      CREATE TABLE IF NOT EXISTS patient_cases (
        caseId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patientId UUID NOT NULL REFERENCES users(userId) ON DELETE CASCADE,
        doctorId UUID REFERENCES users(userId) ON DELETE SET NULL, -- Doctor can be initially null
        status VARCHAR(50) NOT NULL DEFAULT 'Pending Assignment', -- e.g., Pending Assignment, Pending Review, Report Generated, Closed
        data JSONB, -- For LLM outputs, patient initial data text, etc.
        chatHistory JSONB, -- Can store array of chat messages, or use separate table
        finalReport TEXT, -- For doctor's markdown report
        createdAt TIMESTAMPTZ DEFAULT NOW(),
        updatedAt TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await db.query(queryText);
  },

  async create(patientId, initialData = {}) {
    const queryText = `
      INSERT INTO patient_cases (patientId, data, status)
      VALUES ($1, $2, 'Pending Doctor Selection')
      RETURNING *;
    `;
    // Store initial patient text or file references in 'data'
    const caseData = { initialInput: initialData };
    const { rows } = await db.query(queryText, [patientId, caseData]);
    return rows[0];
  },

  async findById(caseId) {
    const queryText = 'SELECT * FROM patient_cases WHERE caseId = $1';
    const { rows } = await db.query(queryText, [caseId]);
    return rows[0];
  },

  async findByPatientId(patientId) {
    const queryText = 'SELECT * FROM patient_cases WHERE patientId = $1 ORDER BY createdAt DESC';
    const { rows } = await db.query(queryText, [patientId]);
    return rows;
  },

  async findByDoctorId(doctorId) {
    const queryText = 'SELECT * FROM patient_cases WHERE doctorId = $1 ORDER BY createdAt DESC';
    const { rows } = await db.query(queryText, [doctorId]);
    return rows;
  },

  async assignDoctor(caseId, doctorId) {
    const queryText = `
      UPDATE patient_cases
      SET doctorId = $1, status = 'Under Review', updatedAt = NOW()
      WHERE caseId = $2
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [doctorId, caseId]);
    return rows[0];
  },

  async updateStatus(caseId, status) {
    const queryText = `
      UPDATE patient_cases
      SET status = $1, updatedAt = NOW()
      WHERE caseId = $2
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [status, caseId]);
    return rows[0];
  },

  async updateData(caseId, newData) {
    // This function appends to the existing data JSONB object.
    // It's a simple merge; more sophisticated logic might be needed (e.g., for arrays within JSON).
    const queryText = `
      UPDATE patient_cases
      SET data = data || $1::jsonb, updatedAt = NOW()
      WHERE caseId = $2
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [newData, caseId]);
    return rows[0];
  },

  async addChatMessage(caseId, message) {
    // Appends a message to the chatHistory JSONB array
    // Message should be an object like { senderId, senderRole, content, timestamp }
    const queryText = `
      UPDATE patient_cases
      SET chatHistory = COALESCE(chatHistory, '[]'::jsonb) || $1::jsonb,
          updatedAt = NOW()
      WHERE caseId = $2
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [message, caseId]);
    return rows[0];
  },

  async saveFinalReport(caseId, reportContent) {
    const queryText = `
      UPDATE patient_cases
      SET finalReport = $1, status = 'Report Generated', updatedAt = NOW()
      WHERE caseId = $2
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [reportContent, caseId]);
    return rows[0];
  }
  // Add other necessary methods like delete etc. later if needed
};

module.exports = CaseModel;
