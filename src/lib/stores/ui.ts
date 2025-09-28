import { writable, derived, type Writable } from 'svelte/store';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface UIState {
	currentNoteId: string | null;
	helpPanelOpen: boolean;
	saveStatus: SaveStatus;
}

interface UIStore extends Writable<UIState> {
	setCurrentNote: (noteId: string | null) => void;
	toggleHelpPanel: () => void;
	setSaveStatus: (status: SaveStatus) => void;
	reset: () => void;
}

const defaultState: UIState = {
	currentNoteId: null,
	helpPanelOpen: false,
	saveStatus: 'saved'
};

function createUIStore(): UIStore {
	const { subscribe, set, update } = writable<UIState>(defaultState);

	return {
		subscribe,
		set,
		update,

		setCurrentNote: (noteId: string | null) => {
			update((state) => ({ ...state, currentNoteId: noteId }));
		},

		toggleHelpPanel: () => {
			update((state) => ({ ...state, helpPanelOpen: !state.helpPanelOpen }));
		},

		setSaveStatus: (status: SaveStatus) => {
			update((state) => ({ ...state, saveStatus: status }));
		},

		reset: () => {
			set(defaultState);
		}
	};
}

export const ui = createUIStore();

export const currentNoteId = derived(ui, ($ui) => $ui.currentNoteId);
export const helpPanelOpen = derived(ui, ($ui) => $ui.helpPanelOpen);
export const saveStatus = derived(ui, ($ui) => $ui.saveStatus);
