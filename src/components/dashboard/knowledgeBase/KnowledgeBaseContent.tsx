import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText, Tag, BookOpen, Lightbulb, Code, Pencil, Trash2 } from 'lucide-react';
import { KnowledgeBaseItem, KnowledgeBaseFormData } from '@/types';
import AddEntryModal from './AddEntryModal';

import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';

const INITIAL_ITEMS: KnowledgeBaseItem[] = [
  // {
  //   id: '1',
  //   title: 'Follow the PEP 8 style guide for Python',
  //   description: 'Essential style guide for writing clean Python code. Includes naming conventions, code layout, and best practices.',
  //   tags: ['python', 'style-guide', 'coding-standards'],
  //   type: 'coding'
  // },
  // {
  //   id: '2',
  //   title: 'Internal Style Guide Documentation',
  //   description: 'Company-wide coding standards and best practices for maintaining consistent code quality across all projects.',
  //   tags: ['internal', 'documentation'],
  //   type: 'docs'
  // },
  // {
  //   id: '3',
  //   title: 'Secure Coding Techniques',
  //   description: 'Guidelines for writing secure and vulnerability-free code. Includes common security pitfalls and how to avoid them.',
  //   tags: ['security', 'best-practices'],
  //   type: 'other'
  // }
];

const KnowledgeBaseContent: React.FC = () => {
  const { entries, isLoading, error, addEntry, updateKnowledgeBase, removeEntry } = useKnowledgeBase();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeBaseItem | null>(null);

  const filteredItems = useMemo(() => {
    if (!entries) return [];
    const query = searchQuery.toLowerCase();
    return entries.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [entries, searchQuery]);

  const handleAddEntry = (newEntry: KnowledgeBaseFormData) => {
    addEntry(newEntry);
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleUpdateEntry = (updatedEntry: KnowledgeBaseFormData) => {
    if (selectedEntry?._id) {
      updateKnowledgeBase({ 
        id: selectedEntry._id, 
        data: updatedEntry 
      });
      setIsModalOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const renderSection = (type: KnowledgeBaseItem['type'], title: string, icon: React.ReactNode) => {
    const sectionItems = filteredItems.filter(item => item.type === type);
    
    if (sectionItems.length === 0) return null;

    return (
      <section className="animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardContent className="divide-y p-0">
            {sectionItems.map((item) => (
              <div 
                key={item._id}
                className="p-4 hover:bg-accent/5 transition-colors rounded-lg relative"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 flex items-center gap-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <Badge 
                          key={`${item._id}-${tag}`}
                          variant="secondary" 
                          className="text-xs hover:bg-primary/20 cursor-pointer transition-colors"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Always Visible Actions Menu */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        setSelectedEntry(item);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this entry?')) {
                          removeEntry(item._id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -right-6 w-12 h-12 bg-purple-500/10 rounded-full animate-pulse delay-150" />
            <BookOpen size={48} className="text-primary relative z-10" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Build Your Knowledge Base</h2>
        <p className="text-muted-foreground mb-8">
          Start documenting your team's best practices, coding standards, and important guidelines.
        </p>
        
        <div className="grid gap-4 mb-8 md:grid-cols-3">
          <Card className="p-4 text-center hover:shadow-md transition-all">
            <Code size={24} className="mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium mb-1">Coding Practices</h3>
            <p className="text-sm text-muted-foreground">Style guides and standards</p>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-all">
            <FileText size={24} className="mx-auto mb-2 text-green-500" />
            <h3 className="font-medium mb-1">Documentation</h3>
            <p className="text-sm text-muted-foreground">Important references</p>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-all">
            <Lightbulb size={24} className="mx-auto mb-2 text-purple-500" />
            <h3 className="font-medium mb-1">Best Practices</h3>
            <p className="text-sm text-muted-foreground">Tips and guidelines</p>
          </Card>
        </div>
        
        <Button 
          className="button-glow"
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} className="mr-2" />
          Create Your First Entry
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Centralized repository for coding guidelines and documentation</p>
        </div>
        {entries && entries.length > 0 && (
          <Button 
            className="button-glow flex items-center gap-2" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add New Entry
          </Button>
        )}
      </div>

      {entries && entries.length > 0 ? (
        <>
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search knowledge base..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-8">
            {renderSection('coding', 'Coding Practices', <Code size={20} className="text-blue-500" />)}
            {renderSection('docs', 'Important Documentation', <FileText size={20} className="text-green-500" />)}
            {renderSection('other', 'Other Information', <Tag size={20} className="text-purple-500" />)}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No entries found matching your search.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState />
      )}

      <AddEntryModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedEntry ? handleUpdateEntry : handleAddEntry}
        initialData={selectedEntry}
      />
    </div>
  );
};

export default KnowledgeBaseContent; 