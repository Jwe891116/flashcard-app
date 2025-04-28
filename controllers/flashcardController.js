import {
  fetchAllFlashcards,
  createFlashcard,
  modifyFlashcard,
  removeFlashcard,
  getTotalFlashcardsCount,
  getFlashcardsForStudy
} from "../models/flashcardModel.js";

export const getAllFlashcards = async (req, res) => {
  try {
    const { search, category, page = 1 } = req.query;
    const pageSize = 12;
    const flashcards = await fetchAllFlashcards(search, category, page, pageSize);
    const totalFlashcards = await getTotalFlashcardsCount(search, category);
    const totalPages = Math.ceil(totalFlashcards / pageSize);

    const errors = req.query.errors
      ? (Array.isArray(req.query.errors) ? req.query.errors : [req.query.errors])
      : null;

    res.render('index', {
      title: 'Flashcard App',
      flashcards,
      editingFlashcard: null,
      errors,
      front: req.query.front || '',
      back: req.query.back || '',
      category: req.query.category || '',
      difficulty: req.query.difficulty || 1,
      search: search || '',
      categoryFilter: category,
      currentPage: parseInt(page),
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      studyMode: false
    });
  } catch (err) {
    console.error("Error fetching flashcards:", err);
    res.status(500).send("Server Error");
  }
};

export const addFlashcard = async (req, res) => {
  const { front, back, category } = req.body;
  const difficulty = parseInt(req.body.difficulty) || 1;

  const errors = validateFlashcardInput(front, back, category);
  if (errors.length > 0) {
    const queryParams = new URLSearchParams();
    errors.forEach(e => queryParams.append('errors', e));
    queryParams.set('front', front);
    queryParams.set('back', back || '');
    queryParams.set('category', category || '');
    queryParams.set('difficulty', difficulty);
    return res.redirect(`/?${queryParams.toString()}`);
  }

  try {
    await createFlashcard(front, back, category, difficulty);
    res.redirect('/');
  } catch (err) {
    console.error("Error adding flashcard:", err);
    res.status(500).send("Server Error");
  }
};

export const deleteFlashcard = async (req, res) => {
  const flashcardId = parseInt(req.params.id);
  try {
    await removeFlashcard(flashcardId);
    res.redirect(req.headers.referer || '/');
  } catch (err) {
    console.error("Error deleting flashcard:", err);
    res.status(500).send("Server Error");
  }
};

export const updateFlashcard = async (req, res) => {
  const flashcardId = parseInt(req.params.id);
  const { front, back, category } = req.body;
  const difficulty = parseInt(req.body.difficulty) || 1;

  const errors = validateFlashcardInput(front, back, category);
  if (errors.length > 0) {
    const queryParams = new URLSearchParams();
    errors.forEach(e => queryParams.append('errors', e));
    queryParams.set('front', front);
    queryParams.set('back', back || '');
    queryParams.set('category', category || '');
    queryParams.set('difficulty', difficulty);
    return res.redirect(`/?${queryParams.toString()}`);
  }

  try {
    await modifyFlashcard(flashcardId, front, back, category, difficulty);
    res.redirect('/');
  } catch (err) {
    console.error("Error updating flashcard:", err);
    res.status(500).send("Server Error");
  }
};

export const prepareEditFlashcard = async (req, res) => {
  const { flashcardId, front, back, category, difficulty } = req.body;
  const refererUrl = new URL(req.headers.referer);
  const search = refererUrl.searchParams.get('search') || '';
  const categoryFilter = refererUrl.searchParams.get('category');
  const page = refererUrl.searchParams.get('page') || 1;

  try {
    const flashcards = await fetchAllFlashcards(search, categoryFilter, page, 12);
    const totalFlashcards = await getTotalFlashcardsCount(search, categoryFilter);
    const totalPages = Math.ceil(totalFlashcards / 12);

    res.render('index', {
      flashcards,
      editingFlashcard: {
        id: flashcardId,
        front,
        back,
        category,
        difficulty
      },
      errors: null,
      front: '',
      back: '',
      category: '',
      difficulty: 1,
      search: search || '',
      categoryFilter: categoryFilter,
      currentPage: parseInt(page),
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      studyMode: false
    });
  } catch (err) {
    console.error("Error preparing to edit flashcard:", err);
    res.status(500).send("Server Error");
  }
};

export const startStudySession = async (req, res) => {
  const { category } = req.query;
  try {
    const flashcards = await getFlashcardsForStudy(category);
    if (flashcards.length === 0) {
      return res.redirect('/?errors=No flashcards found to study');
    }

    res.render('index', {
      title: 'Study Mode',
      flashcards,
      editingFlashcard: null,
      errors: null,
      front: '',
      back: '',
      category: '',
      difficulty: 1,
      search: '',
      categoryFilter: category,
      currentPage: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      studyMode: true,
      currentCardIndex: 0
    });
  } catch (err) {
    console.error("Error starting study session:", err);
    res.status(500).send("Server Error");
  }
};

function validateFlashcardInput(front, back, category) {
  const errors = [];
  
  // Front (Question/Term) validation
  if (!front || front.trim().length === 0) {
    errors.push("Question/Term is required");
  } else if (front.trim().length < 3) {
    errors.push("Question/Term must be at least 3 characters");
  } else if (front.trim().length > 500) {
    errors.push("Question/Term cannot exceed 500 characters");
  }

  // Back (Answer/Definition) validation
  if (!back || back.trim().length === 0) {
    errors.push("Answer/Definition is required");
  } else if (back.trim().length > 1000) {
    errors.push("Answer/Definition cannot exceed 1000 characters");
  }

  // Category validation (optional field)
  if(!category || category.trim().length ===0) {
    errors.push("Category is required");
  }
  else if (category.trim().length > 50) {
    errors.push("Category cannot exceed 50 characters");
  }

  return errors;
}