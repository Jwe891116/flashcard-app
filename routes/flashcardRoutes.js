import express from "express";
import {
  getAllFlashcards,
  addFlashcard,
  deleteFlashcard,
  updateFlashcard,
  prepareEditFlashcard,
  startStudySession
} from "../controllers/flashcardController.js";

const router = express.Router();

router.get("/", getAllFlashcards);
router.post('/flashcards', addFlashcard);
router.post('/edit-flashcard', prepareEditFlashcard);
router.delete('/flashcards/:id', deleteFlashcard);
router.put('/flashcards/:id', updateFlashcard);
router.get('/study', startStudySession);

export default router;