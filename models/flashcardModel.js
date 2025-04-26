import { pool } from "../config/db.js";

export const fetchAllFlashcards = async (searchTerm = '', category = 'all', page = 1, pageSize = 12) => {
  let query = "SELECT * FROM flashcards";
  const params = [];
  let conditions = [];

  if (searchTerm) {
    conditions.push(`(front ILIKE $${params.length + 1} OR back ILIKE $${params.length + 1})`);
    params.push(`%${searchTerm}%`);
  }

  if (category !== 'all') {
    conditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY created_at";
  
  const offset = (page - 1) * pageSize;
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(pageSize, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const getTotalFlashcardsCount = async (searchTerm = '', category = 'all') => {
  let query = "SELECT COUNT(*) FROM flashcards";
  const params = [];
  let conditions = [];

  if (searchTerm) {
    conditions.push(`(front ILIKE $${params.length + 1} OR back ILIKE $${params.length + 1})`);
    params.push(`%${searchTerm}%`);
  }

  if (category !== 'all') {
    conditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count);
};

export const createFlashcard = async (front, back, category, difficulty = 1) => {
  await pool.query(
    "INSERT INTO flashcards (front, back, category, difficulty) VALUES ($1, $2, $3, $4)",
    [front.trim(), back.trim(), category?.trim() || null, difficulty]
  );
};

export const modifyFlashcard = async (flashcardId, front, back, category, difficulty) => {
  await pool.query(
    "UPDATE flashcards SET front = $1, back = $2, category = $3, difficulty = $4, updated_at = NOW() WHERE id = $5",
    [front.trim(), back.trim(), category?.trim() || null, difficulty, flashcardId]
  );
};

export const removeFlashcard = async (flashcardId) => {
  await pool.query("DELETE FROM flashcards WHERE id = $1", [flashcardId]);
};

export const getFlashcardsForStudy = async (category = 'all') => {
  let query = "SELECT * FROM flashcards";
  const params = [];
  
  if (category !== 'all') {
    query += " WHERE category = $1";
    params.push(category);
  }

  query += " ORDER BY RANDOM()";
  const result = await pool.query(query, params);
  return result.rows;
};
