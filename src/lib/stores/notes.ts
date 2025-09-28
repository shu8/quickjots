import { writable, derived, get, type Writable } from 'svelte/store';
import type { Note, UpdateNoteData } from '$lib/types/index.js';
import { storageService } from '$lib/services/storage.js';
import { sortNotesByDate, isNoteEmpty } from '$lib/utils/index.js';

interface NotesStore extends Writable<Note[]> {
	load: () => Promise<void>;
	add: (content?: string) => Promise<Note>;
	updateNote: (id: string, content: string) => Promise<void>;
	delete: (id: string) => Promise<void>;
	deleteIfEmpty: (id: string) => Promise<boolean>;
	getById: (id: string) => Note | undefined;
	clear: () => void;
}

function createNotesStore(): NotesStore {
	const { subscribe, set, update } = writable<Note[]>([]);

	return {
		subscribe,
		set,
		update,

		async load(): Promise<void> {
			try {
				const notes = await storageService.getAllNotes();
				set(sortNotesByDate(notes));
			} catch (error) {
				console.error('Failed to load notes:', error);
				set([]);
			}
		},

		async add(content: string = ''): Promise<Note> {
			const noteData: UpdateNoteData = { content };
			const newNote = await storageService.createNote(noteData);

			update((notes) => {
				const updatedNotes = [newNote, ...notes];
				return sortNotesByDate(updatedNotes);
			});

			return newNote;
		},

		async updateNote(id: string, content: string): Promise<void> {
			const updateData: UpdateNoteData = { content };
			const updatedNote = await storageService.updateNote(id, updateData);

			update((notes) => {
				const updatedNotes = notes.map((note) => (note.id === id ? updatedNote : note));
				return sortNotesByDate(updatedNotes);
			});
		},

		async delete(id: string): Promise<void> {
			await storageService.deleteNote(id);

			update((notes) => notes.filter((note) => note.id !== id));
		},

		async deleteIfEmpty(id: string): Promise<boolean> {
			const currentNotes = get({ subscribe });
			const note = currentNotes.find((n) => n.id === id);

			if (!note || !isNoteEmpty(note.content)) {
				return false;
			}

			await this.delete(id);
			return true;
		},

		getById(id: string): Note | undefined {
			const currentNotes = get({ subscribe });
			return currentNotes.find((note) => note.id === id);
		},

		clear(): void {
			set([]);
		}
	};
}

export const notes = createNotesStore();
export const sortedNotes = derived(notes, ($notes: Note[]) => sortNotesByDate($notes));
