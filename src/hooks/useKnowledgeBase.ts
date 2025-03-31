import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KnowledgeBaseItem, KnowledgeBaseFormData } from '@/types';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

export const useKnowledgeBase = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    const fetchEntries = async (): Promise<KnowledgeBaseItem[]> => {
      const response = await fetch('/api/knowledge-base');
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    };
  
    const createEntry = async (entry: KnowledgeBaseFormData) => {
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          access: {
            type: 'private',
            allowedUsers: [],
            allowedTeams: [],
            organizationId: null
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to create entry');
      return response.json();
    };
  
    const { data: entries, isLoading, error } = useQuery({
      queryKey: ['knowledge-base'],
      queryFn: fetchEntries,
      enabled: !!session,
    });
  
    const { mutate: addEntry } = useMutation({
      mutationFn: createEntry,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
        toast({
          title: "Success",
          description: "Knowledge base entry created successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create knowledge base entry",
          variant: "destructive",
        });
      },
    });
  
    const updateEntry = async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: KnowledgeBaseFormData 
    }) => {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update entry');
      return response.json();
    };
  
    const deleteEntry = async (id: string) => {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete entry');
      return response.json();
    };
  
    const { mutate: updateKnowledgeBase } = useMutation({
      mutationFn: ({ id, data }: { id: string; data: KnowledgeBaseFormData }) =>
        updateEntry({ id, data }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
        toast({
          title: "Success",
          description: "Knowledge base entry updated successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update knowledge base entry",
          variant: "destructive",
        });
      },
    });
  
    const { mutate: removeEntry } = useMutation({
      mutationFn: deleteEntry,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
        toast({
          title: "Success",
          description: "Knowledge base entry deleted successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete knowledge base entry",
          variant: "destructive",
        });
      },
    });
  
    return {
      entries,
      isLoading,
      error,
      addEntry,
      updateKnowledgeBase,
      removeEntry,
    };
  };