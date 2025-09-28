import type { Note } from './Note.js';

export interface Settings {
	darkMode: boolean;
	notesListCollapsed: boolean;
}

export interface DatabaseStores {
	NOTES_STORE: 'notes';
	METADATA_STORE: 'quickjots_metadata';
	MAIN_STORE: 'quickjots';
}

export interface DatabaseConfig {
	name: string;
	version: number;
	stores: DatabaseStores;
}
