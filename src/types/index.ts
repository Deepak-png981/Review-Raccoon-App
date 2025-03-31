export interface KnowledgeBaseItem {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    type: 'coding' | 'docs' | 'other';
    createdBy: string;
    access: {
        type: 'private' | 'team' | 'organization';
        allowedUsers: string[];
        allowedTeams: string[];
        organizationId: string | null;
    };
    createdAt: string;
    updatedAt: string;
}

export type KnowledgeBaseFormData = {
    title: string;
    description: string;
    tags: string[];
    type: KnowledgeBaseItem['type'];
};
