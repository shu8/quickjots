import { ui } from '$lib/stores';
import type { Note, UpdateNoteData, RawNote, Settings, DatabaseConfig } from '$lib/types/index.js';

class StorageService {
  private db: IDBDatabase | null = null;
  private readonly config: DatabaseConfig = {
    name: 'quickjots',
    version: 2,
    stores: {
      NOTES_STORE: 'notes',
      METADATA_STORE: 'quickjots_metadata',
      MAIN_STORE: 'quickjots' // Legacy store for migration
    }
  };

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        console.error('Database failed to open:', request.error);
        reject(request.error);
      };

      let migrating = false;
      request.onupgradeneeded = async (e) => {
        migrating = true;

        const db = (e.target as IDBOpenDBRequest).result;
        this.db = db;

        const oldVersion = e.oldVersion;
        const transaction = (e.target as IDBOpenDBRequest).transaction!;

        console.info(`Upgrading database from version ${oldVersion} to ${this.config.version}`);

        try {
          await this.handleDatabaseUpgrade(oldVersion, transaction);
        } catch (error) {
          console.error('Database upgrade failed:', error);
          reject(error);
        }
        resolve();
      };

      request.onsuccess = () => {
        if (!migrating) {
          this.db = request.result;
          console.info('Database opened successfully');
          resolve();
        }
      };
    });
  }

  private async handleDatabaseUpgrade(
    oldVersion: number,
    transaction: IDBTransaction
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Handling database upgrade from old version', oldVersion);

      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // Create metadata store if it doesn't exist (v0 -> v1 or fresh install)
      if (oldVersion < 1) {
        const metadataStore = this.db.createObjectStore(this.config.stores.METADATA_STORE, {
          keyPath: 'name'
        });
        metadataStore.createIndex('value', 'value', { unique: false });
        metadataStore.put({ name: 'dark', value: false });

        // Create the old main store for v1
        const quickjotsStore = this.db.createObjectStore(this.config.stores.MAIN_STORE, {
          keyPath: 'type'
        });
        quickjotsStore.put({ type: 'markdown', content: '' });
        quickjotsStore.put({ type: 'plaintext', content: '' });
      }

      // Upgrade v1 -> v2: Create new notes store and migrate data
      if (oldVersion < 2) {
        // Create new notes store
        const notesStore = this.db.createObjectStore(this.config.stores.NOTES_STORE, {
          keyPath: 'id'
        });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        notesStore.createIndex('createdAt', 'createdAt', { unique: false });

        // Migration will be handled after the database is fully open
        transaction.oncomplete = () => {
          this.performV1ToV2Migration().then(resolve).catch(reject);
        };
      }
    });
  }

  private async performV1ToV2Migration(): Promise<void> {
    try {
      const oldMarkdown = await this.getLegacyData('markdown');
      const oldPlaintext = await this.getLegacyData('plaintext');

      const now = new Date();
      const migratedNotes: Note[] = [];

      // Create a welcome note for migrated users
      const welcomeNote: Note = {
        id: 'welcome',
        content:
          'Welcome to the new QuickJots! You can now jot down and manage multiple notes with a brand new UI, and keyboard shortcuts!',
        createdAt: now,
        updatedAt: now
      };
      await this.createNote(welcomeNote);
      migratedNotes.push(welcomeNote);

      // Create notes from old data if they contain content
      if (oldMarkdown && oldMarkdown.trim()) {
        const markdownNote: Note = {
          id: this.generateNoteId(),
          content: oldMarkdown,
          createdAt: now,
          updatedAt: now
        };
        await this.createNote(markdownNote);
        migratedNotes.push(markdownNote);
      }

      if (oldPlaintext && oldPlaintext.trim()) {
        const plaintextNote: Note = {
          id: this.generateNoteId(),
          content: oldPlaintext,
          createdAt: now,
          updatedAt: now
        };
        await this.createNote(plaintextNote);
        migratedNotes.push(plaintextNote);
      }

      console.info(`Migration completed: ${migratedNotes.length} notes migrated`, migratedNotes);
    } catch (error) {
      console.error('Migration failed:', error);
      window.alert('Migration failed. Please contact shubham@quickjots.app for support.');
    }
  }

  private async getLegacyData(type: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        const transaction = this.db.transaction([this.config.stores.MAIN_STORE], 'readonly');
        const store = transaction.objectStore(this.config.stores.MAIN_STORE);
        const request = store.get(type);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result?.text);
        };

        request.onerror = (e) => reject(e);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAllNotes(): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.config.stores.NOTES_STORE], 'readonly');
      const store = transaction.objectStore(this.config.stores.NOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const rawNotes: RawNote[] = request.result;
        const notes: Note[] = rawNotes
          .map(this.deserializeNote)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        resolve(notes);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async createNote(noteData: UpdateNoteData | Note): Promise<Note> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const now = new Date();
      const note: Note =
        'id' in noteData
          ? noteData
          : {
              id: this.generateNoteId(),
              content: noteData.content,
              createdAt: now,
              updatedAt: now
            };

      const transaction = this.db.transaction([this.config.stores.NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(this.config.stores.NOTES_STORE);
      const request = store.add(this.serializeNote(note));

      request.onsuccess = () => resolve(note);
      request.onerror = () => reject(request.error);
    });
  }

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.config.stores.NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(this.config.stores.NOTES_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingNote = getRequest.result;
        if (!existingNote) {
          reject(new Error('Note not found'));
          return;
        }

        const updatedNote: Note = {
          ...this.deserializeNote(existingNote),
          content: data.content,
          updatedAt: new Date()
        };

        const putRequest = store.put(this.serializeNote(updatedNote));
        putRequest.onsuccess = () => resolve(updatedNote);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteNote(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.config.stores.NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(this.config.stores.NOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSettings(): Promise<Settings> {
    const [darkMode, notesListCollapsed] = await Promise.all([
      this.getSetting('dark', false),
      this.getSetting('notesCollapsed', false),
      this.getSetting('lastOpened', null)
    ]);

    return { darkMode, notesListCollapsed };
  }

  async saveSetting<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.config.stores.METADATA_STORE], 'readwrite');
      const store = transaction.objectStore(this.config.stores.METADATA_STORE);
      const request = store.put({ name: key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(defaultValue);
        return;
      }

      const transaction = this.db.transaction([this.config.stores.METADATA_STORE], 'readonly');
      const store = transaction.objectStore(this.config.stores.METADATA_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.value != null ? result.value : defaultValue);
      };

      request.onerror = () => resolve(defaultValue);
    });
  }

  generateNoteId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  generateNoteTitle(content: string, createdAt: Date): string {
    const trimmed = content.trim();
    if (!trimmed) {
      return `Untitled - ${this.formatDate(createdAt)}`;
    }

    const firstLine = trimmed.split('\n')[0] ?? '';
    const truncated = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;

    return truncated || `Untitled - ${this.formatDate(createdAt)}`;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString();
  }

  private serializeNote(note: Note): RawNote {
    return {
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    };
  }

  private deserializeNote(rawNote: RawNote): Note {
    return {
      ...rawNote,
      createdAt: new Date(rawNote.createdAt),
      updatedAt: new Date(rawNote.updatedAt)
    };
  }
}

export const storageService = new StorageService();
