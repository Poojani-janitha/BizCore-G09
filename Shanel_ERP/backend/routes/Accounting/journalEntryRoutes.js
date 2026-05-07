const express = require('express');
const router = express.Router();
const journalEntryController = require('../../controllers/Accounting&Finance/JournalEntryController');

// Get all journal entries
router.get('/', (req, res) => journalEntryController.getAllJournalEntries(req, res));

// Get journal entry details
router.get('/:id', (req, res) => journalEntryController.getJournalEntryDetails(req, res));

module.exports = router;
