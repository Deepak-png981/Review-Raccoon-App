export interface KnowledgeBaseItem {
    id: string;
    title: string;
    description: string;
    tags: string[];
    type: 'coding' | 'docs' | 'other';
}
