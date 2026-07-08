export interface Note {
	id: string;
	author: string;
	timestamp: string;
	content: string;
	category: 'Case' | 'Document';
	documentId?: string;
	documentName?: string;
	isEdited: boolean;
	lastEditedAt?: string;
}

export interface AIPrompt {
	id: string;
	category: string;
	prompt: string;
	description: string;
}
