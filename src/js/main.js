const SAVE_AFTER_INSERTIONS = 10;
require('../css/quickjots.css');

(quickjots => {
  // Do nothing on the homepage
  if (document.body.classList.contains('homepage')) return;

  // Register service worker
  if ('serviceWorker' in navigator) {
    console.info('Service worker registration in progress');
    navigator.serviceWorker.register('/service-worker.js');
  } else {
    console.info('Service worker not supported, this webapp will not work offline in this browser.');
  }

  // New state management for single editor + notes list
  quickjots.state = {
    currentNoteId: null,
    notes: [],
    notesListCollapsed: false,
    editor: {
      element: document.getElementById('note-editor'),
      insertionsSinceSave: 0,
      modified: false,
    },
    ui: {
      notesList: document.getElementById('notes-list'),
      notesListArea: document.getElementById('notes-list-area'),
      notesCount: document.getElementById('notes-count'),
      saveStatus: document.getElementById('save-status'),
      newNoteBtn: document.getElementById('new-note-btn'),
      collapseToggle: document.getElementById('notes-collapse-toggle'),
    }
  };

  // Notes list collapse/expand functionality
  quickjots.toggleNotesListCollapse = () => {
    const notesArea = quickjots.state.ui.notesListArea;
    const collapseToggle = quickjots.state.ui.collapseToggle;
    const toggleIcon = collapseToggle.querySelector('svg path');

    quickjots.state.notesListCollapsed = !quickjots.state.notesListCollapsed;

    if (quickjots.state.notesListCollapsed) {
      notesArea.classList.add('collapsed');
      collapseToggle.title = 'Expand notes list';
      collapseToggle.setAttribute('aria-label', 'Expand notes list');
      // Show plus icon when collapsed
      toggleIcon.setAttribute('d', 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');
    } else {
      notesArea.classList.remove('collapsed');
      collapseToggle.title = 'Collapse notes list';
      collapseToggle.setAttribute('aria-label', 'Collapse notes list');
      // Show minus icon when expanded
      toggleIcon.setAttribute('d', 'M19 13H5v-2h14v2z');
    }

    // Save collapse state to user preferences
    quickjots.storage.save('notes_list_collapsed', quickjots.state.notesListCollapsed, quickjots.storage.METADATA_STORE, result => {
      if (!result.success) console.error('Failed to save notes list collapse state:', result.err);
    });

    console.info('Notes list', quickjots.state.notesListCollapsed ? 'collapsed' : 'expanded');
  };


  // Notes list management
  quickjots.renderNotesList = () => {
    const notesList = quickjots.state.ui.notesList;
    const notesCount = quickjots.state.ui.notesCount;
    const notes = quickjots.state.notes;

    // Update notes count
    notesCount.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;

    // Clear existing list
    notesList.innerHTML = '';

    if (notes.length === 0) {
      notesList.innerHTML = '<div class="notes-list-empty">No notes yet. Create your first note!</div>';
      return;
    }

    // Render each note
    notes.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note-item';
      noteElement.dataset.noteId = note.id;

      if (note.id === quickjots.state.currentNoteId) {
        noteElement.classList.add('selected');
      }

      const title = quickjots.storage.generateNoteTitle(note.content, note.createdAt);
      const date = quickjots.storage.formatDate(note.updatedAt);

      noteElement.innerHTML = `
        <div class="note-title">${title}</div>
        <div class="note-date">${date}</div>
      `;

      // Add click handler for note selection
      noteElement.addEventListener('click', () => {
        quickjots.selectNote(note.id);
      });

      notesList.appendChild(noteElement);
    });
  };

  // Note selection
  quickjots.selectNote = noteId => {
    // Save current note if modified
    if (quickjots.state.modified && quickjots.state.currentNoteId) {
      quickjots.saveCurrentNote();
    }

    // Find and load the note
    const note = quickjots.state.notes.find(n => n.id === noteId);
    if (note) {
      quickjots.state.currentNoteId = noteId;
      quickjots.state.editor.element.value = note.content;
      quickjots.state.editor.modified = false;
      quickjots.state.editor.insertionsSinceSave = 0;

      // Update UI
      quickjots.updateSaveStatus('saved');
      quickjots.renderNotesList(); // Re-render to update selection

      console.info('Loaded note:', noteId);
    }
  };

  // Load all notes from storage
  quickjots.loadAllNotes = () => {
    quickjots.storage.getAllNotes(result => {
      if (result.success) {
        quickjots.state.notes = result.notes;
        quickjots.renderNotesList();

        // Load the first note if we don't have a current note selected
        if (!quickjots.state.currentNoteId && result.notes.length > 0) {
          quickjots.selectNote(result.notes[0].id);
        }

        console.info('Loaded', result.notes.length, 'notes');
      } else {
        console.error('Failed to load notes:', result.err);
        quickjots.state.ui.notesList.innerHTML = '<div class="notes-list-empty">Error loading notes</div>';
      }
    });
  };

  // Save current note
  quickjots.saveCurrentNote = () => {
    if (!quickjots.state.currentNoteId || !quickjots.state.editor.modified) {
      return;
    }

    const content = quickjots.state.editor.element.value;
    quickjots.updateSaveStatus('saving');

    quickjots.storage.updateNote(quickjots.state.currentNoteId, content, result => {
      if (result.success) {
        // Update local state
        const noteIndex = quickjots.state.notes.findIndex(n => n.id === quickjots.state.currentNoteId);
        if (noteIndex !== -1) {
          quickjots.state.notes[noteIndex] = result.note;
        }

        quickjots.state.editor.modified = false;
        quickjots.state.editor.insertionsSinceSave = 0;
        quickjots.updateSaveStatus('saved');

        // Re-render notes list to update title and date
        quickjots.renderNotesList();

        console.info('Saved note:', quickjots.state.currentNoteId);
      } else {
        quickjots.updateSaveStatus('error');
        console.error('Failed to save note:', result.err);
      }
    });
  };

  // Create new note
  quickjots.createNewNote = () => {
    // Save current note if modified
    if (quickjots.state.editor.modified && quickjots.state.currentNoteId) {
      quickjots.saveCurrentNote();
    }

    quickjots.storage.createNote('', result => {
      if (result.success) {
        // Add to local state
        quickjots.state.notes.unshift(result.note);

        // Select the new note
        quickjots.selectNote(result.note.id);

        // Focus the editor
        quickjots.state.editor.element.focus();

        console.info('Created new note:', result.note.id);
      } else {
        console.error('Failed to create note:', result.err);
        alert('Failed to create new note. Please try again.');
      }
    });
  };

  // Update save status indicator
  quickjots.updateSaveStatus = status => {
    const statusElement = quickjots.state.ui.saveStatus;
    statusElement.className = '';
    statusElement.classList.add(status);

    switch (status) {
    case 'saving':
      statusElement.textContent = 'saving...';
      break;
    case 'saved':
      statusElement.textContent = 'saved';
      break;
    case 'error':
      statusElement.textContent = 'error';
      break;
    default:
      statusElement.textContent = 'unsaved';
    }
  };

  // Text change listener for auto-save
  quickjots.textChangeListener = e => {
    if (!quickjots.state.currentNoteId) return;

    quickjots.state.editor.insertionsSinceSave++;
    quickjots.state.editor.modified = true;
    quickjots.updateSaveStatus('unsaved');

    // Looking for `type` in Edge, `inputType` in other browsers
    const inputType = e.inputType || e.type;

    if (
      // Save as soon as something is pasted
      (inputType === 'paste') || (inputType === 'insertFromPaste') ||
      // Save on any backspaces/chunk deletes
      (inputType === 'deleteContentBackward') ||
      // Save every SAVE_AFTER_INSERTIONS insertions
      ((inputType === 'input' || inputType === 'insertText') &&
        quickjots.state.editor.insertionsSinceSave >= SAVE_AFTER_INSERTIONS)
    ) {
      quickjots.saveCurrentNote();
    }
  };

  // Restore database contents - updated for new schema
  quickjots.restoreDBContents = () => {
    console.info('Restoring database contents...');

    // Load dark mode preference
    quickjots.storage.get('dark', quickjots.storage.METADATA_STORE, result => {
      if (result.success && result.value && result.value.value) {
        document.body.classList.add('dark');
      }
    });

    // Load notes list collapse state
    quickjots.storage.get('notes_list_collapsed', quickjots.storage.METADATA_STORE, result => {
      if (result.success && result.value && result.value.value) {
        quickjots.state.notesListCollapsed = true;
        quickjots.state.ui.notesListArea.classList.add('collapsed');
        quickjots.state.ui.collapseToggle.title = 'Expand notes list';
        quickjots.state.ui.collapseToggle.setAttribute('aria-label', 'Expand notes list');
        // Set plus icon for collapsed state
        const toggleIcon = quickjots.state.ui.collapseToggle.querySelector('svg path');
        if (toggleIcon) {
          toggleIcon.setAttribute('d', 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');
        }
      }
    });

    // Load all notes
    quickjots.loadAllNotes();
  };

  // Event listeners
  if (quickjots.state.editor.element) {
    quickjots.state.editor.element.addEventListener('input', quickjots.textChangeListener);
    quickjots.state.editor.element.addEventListener('paste', quickjots.textChangeListener);
  }

  if (quickjots.state.ui.newNoteBtn) {
    quickjots.state.ui.newNoteBtn.addEventListener('click', quickjots.createNewNote);
  }

  if (quickjots.state.ui.collapseToggle) {
    quickjots.state.ui.collapseToggle.addEventListener('click', quickjots.toggleNotesListCollapse);
  }

  // No need for resize listener - CSS handles height automatically

  // Save before page unload
  window.addEventListener('beforeunload', () => {
    if (quickjots.state.editor.modified && quickjots.state.currentNoteId) {
      quickjots.saveCurrentNote();
    }
  });

  console.info('QuickJots initialized with new UI');

})(window.quickjots = window.quickjots || {});