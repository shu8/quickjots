const DB_VERSION = 2;
const DEFAULT_MARKDOWN_TEXT = `**This space is for any of your short-term markdown notes**

You can use GitHub Flavoured Markdown:

- [ ] task lists are supported
- [x] mark items as complete as you finish them

Emojis are supported too! :smile:

Any links become clickable: http://example.com
...[and you can add your own text like this](http://example.com)

Read [the Markdown cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for more details!`;

const DEFAULT_PLAINTEXT = `This space is for any of your short-term plain-text notes.

Follow up claim -- call 01234561298. Reference XC12345567.`;

(quickjots => {
  // Do nothing on the homepage
  if (document.body.classList.contains('homepage')) return;

  quickjots.storage = {
    MAIN_STORE: 'quickjots',
    NOTES_STORE: 'notes',
    METADATA_STORE: 'quickjots_metadata',

    // Title generation utilities
    generateNoteId() {
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },

    formatDate(date) {
      const now = new Date();
      const noteDate = new Date(date);
      const isToday = now.toDateString() === noteDate.toDateString();
      const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === noteDate.toDateString();

      if (isToday) {
        return `Today ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (isYesterday) {
        return `Yesterday ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return noteDate.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },

    generateNoteTitle(content, createdAt) {
      const trimmed = content.trim();
      if (!trimmed) {
        return `Untitled - ${this.formatDate(createdAt)}`;
      }

      const firstLine = trimmed.split('\n')[0];
      const truncated = firstLine.length > 50
        ? firstLine.substring(0, 47) + '...'
        : firstLine;

      return truncated || `Untitled - ${this.formatDate(createdAt)}`;
    },

    transact(mode, desiredStore, cb) {
      try {
        const transaction = this.db.transaction([desiredStore], mode);
        transaction.onerror = e => console.error('Failed transaction', e);

        const store = transaction.objectStore(desiredStore);
        cb(null, transaction, store);
      } catch (err) {
        cb(err);
      }
    },

    save(key, value, desiredStore, cb) {
      this.transact('readwrite', desiredStore, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        try {
          const request = store.put(
            desiredStore === quickjots.storage.MAIN_STORE ?
              { type: key, text: value } : { name: key, value }
          );
          request.onsuccess = () => cb({ success: true });
          request.onerror = () => cb({ success: false });
        } catch (e) {
          cb({ success: false, err: e });
        }
      });
    },

    get(key, desiredStore, cb) {
      this.transact('readonly', desiredStore, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        const request = store.get(key);
        request.onsuccess = () => cb({ success: true, value: request.result });
        request.onerror = () => cb({ successs: false });
      });
    },

    delete(key, desiredStore, cb) {
      this.transact('readwrite', desiredStore, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        try {
          const request = store.delete(key);
          request.onsuccess = () => cb({ success: true });
          request.onerror = () => cb({ success: false });
        } catch (e) {
          cb({ success: false, err: e });
        }
      });
    },

    // New note CRUD operations
    createNote(content = '', cb) {
      const now = new Date().toISOString();
      const note = {
        id: this.generateNoteId(),
        content,
        createdAt: now,
        updatedAt: now
      };

      this.transact('readwrite', this.NOTES_STORE, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        try {
          const request = store.add(note);
          request.onsuccess = () => cb({ success: true, note });
          request.onerror = () => cb({ success: false });
        } catch (e) {
          cb({ success: false, err: e });
        }
      });
    },

    updateNote(noteId, content, cb) {
      this.getNote(noteId, (result) => {
        if (!result.success) return cb(result);

        const updatedNote = Object.assign({}, result.note, {
          content,
          updatedAt: new Date().toISOString()
        });

        this.transact('readwrite', this.NOTES_STORE, (err, transaction, store) => {
          if (err) return cb({ success: false, err });
          try {
            const request = store.put(updatedNote);
            request.onsuccess = () => cb({ success: true, note: updatedNote });
            request.onerror = () => cb({ success: false });
          } catch (e) {
            cb({ success: false, err: e });
          }
        });
      });
    },

    getNote(noteId, cb) {
      this.transact('readonly', this.NOTES_STORE, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        const request = store.get(noteId);
        request.onsuccess = () => cb({
          success: true,
          note: request.result
        });
        request.onerror = () => cb({ success: false });
      });
    },

    getAllNotes(cb) {
      this.transact('readonly', this.NOTES_STORE, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        const request = store.getAll();
        request.onsuccess = () => {
          const notes = request.result.sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          cb({ success: true, notes });
        };
        request.onerror = () => cb({ success: false });
      });
    },

    deleteNote(noteId, cb) {
      this.transact('readwrite', this.NOTES_STORE, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        try {
          const request = store.delete(noteId);
          request.onsuccess = () => cb({ success: true });
          request.onerror = () => cb({ success: false });
        } catch (e) {
          cb({ success: false, err: e });
        }
      });
    }
  };

  const request = window.indexedDB.open('quickjots', DB_VERSION);

  request.onerror = err => console.error('There was an error opening the database', err);

  request.onsuccess = () => {
    console.info('Database opened successfully');
    quickjots.storage.db = request.result;
    quickjots.restoreDBContents();
  };

  request.onupgradeneeded = e => {
    const db = e.target.result;
    const oldVersion = e.oldVersion;
    const transaction = e.target.transaction;

    console.info(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

    // Create metadata store if it doesn't exist (v0 -> v1 or fresh install)
    if (oldVersion < 1) {
      const metadataStore = db.createObjectStore(quickjots.storage.METADATA_STORE, {
        keyPath: 'name',
      });
      metadataStore.createIndex('value', 'value', { unique: false });
      metadataStore.put({ name: 'dark', value: false });

      // Create the old main store for v1
      const quickjotsStore = db.createObjectStore(quickjots.storage.MAIN_STORE, {
        keyPath: 'type',
      });
      quickjotsStore.createIndex('text', 'text', { unique: false });

      const initialMarkdown = { type: 'markdown', text: DEFAULT_MARKDOWN_TEXT };
      const initialPlaintext = { type: 'plaintext', text: DEFAULT_PLAINTEXT };
      const records = [initialMarkdown, initialPlaintext];
      records.forEach(record => quickjotsStore.put(record));

      // Show help for new user
      setTimeout(() => quickjots.toggleHelp && quickjots.toggleHelp(true), 100);
    }

    // Upgrade from v1 to v2: Create new notes store and migrate data
    if (oldVersion < 2) {
      const notesStore = db.createObjectStore(quickjots.storage.NOTES_STORE, {
        keyPath: 'id',
      });
      notesStore.createIndex('createdAt', 'createdAt', { unique: false });
      notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });

      if (oldVersion === 1) {
        // Migration: convert old format to new format
        const oldStore = transaction.objectStore(quickjots.storage.MAIN_STORE);
        const getAllRequest = oldStore.getAll();

        getAllRequest.onsuccess = () => {
          const oldNotes = getAllRequest.result;
          console.info('Migrating', oldNotes.length, 'old notes to new format');

          oldNotes.forEach(oldNote => {
            if (oldNote.type === 'markdown' || oldNote.type === 'plaintext') {
              const newNote = {
                id: quickjots.storage.generateNoteId(),
                content: oldNote.text,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              notesStore.add(newNote);
              console.info(`Migrated ${oldNote.type} note:`, newNote.id);
            }
          });

          console.info('Migration from v1 to v2 completed');
        };

        getAllRequest.onerror = () => {
          console.error('Failed to read old notes during migration');
          // Create a default note if migration fails
          const welcomeNote = {
            id: quickjots.storage.generateNoteId(),
            content: 'Welcome to QuickJots!\n\nStart typing to create your first note. Your notes are automatically saved and stored locally in your browser.\n\n(Note: There was an issue migrating your old notes, but your preferences have been preserved.)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          notesStore.add(welcomeNote);
        };
      } else {
        // Fresh install for v2 - add welcome note
        const welcomeNote = {
          id: quickjots.storage.generateNoteId(),
          content: 'Welcome to QuickJots!\n\nStart typing to create your first note. Your notes are automatically saved and stored locally in your browser.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        notesStore.add(welcomeNote);

        // Add metadata store if this is a completely fresh install
        if (!db.objectStoreNames.contains(quickjots.storage.METADATA_STORE)) {
          const metadataStore = db.createObjectStore(quickjots.storage.METADATA_STORE, {
            keyPath: 'name',
          });
          metadataStore.createIndex('value', 'value', { unique: false });
          metadataStore.put({ name: 'dark', value: false });
        }

        // Show help for new user
        setTimeout(() => quickjots.toggleHelp && quickjots.toggleHelp(true), 100);
      }
    }

    console.info('Database upgrade completed');
  };
})(window.quickjots = window.quickjots || {});
