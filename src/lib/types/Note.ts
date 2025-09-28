export interface Note {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpdateNoteData {
	content: string;
}

export interface RawNote {
	id: string;
	content: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}
