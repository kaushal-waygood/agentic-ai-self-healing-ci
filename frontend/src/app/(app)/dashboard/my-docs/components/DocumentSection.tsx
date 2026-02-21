'use client';

import React, { useState, useEffect } from 'react';
import { FileText, X, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { useSearchParams } from 'next/navigation';
import { DocumentCard } from './DocumentCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import {
  savedStudentCoverLetterRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';
import { useDispatch } from 'react-redux';

export const DocumentSection = ({
  title,
  items,
  onDelete,
  onDeleteSaved,
  onRenameSaved,
  onCopy,
  onDownload,
  copiedId,
  getStatusIcon,
  refreshGeneratedDocs,
  getStatusColor,
  formatDate,
  type,
}: any) => {
  const [visibleCount, setVisibleCount] = useState(10);
  // const [docState, setDocState] = useState<'generated' | 'saved'>('generated');
  const dispatch = useDispatch();

  const searchParams = useSearchParams();

  const initialDocState =
    searchParams.get('q') === 'saved' ? 'saved' : 'generated';

  const [docState, setDocState] = useState<'generated' | 'saved'>(
    initialDocState,
  );

  const [searchTerm, setSearchTerm] = useState('');

  const [finalSearchTerm, setFinalSearchTerm] = useState('');
  useEffect(() => {
    if (searchTerm === '') {
      setFinalSearchTerm('');
    }
  }, [searchTerm]);

  useEffect(() => {
    if (type === 'application') {
      setDocState('generated');
    }
  }, [type]);

  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  const listToRender = (() => {
    if (docState === 'saved') {
      if (type === 'cv') {
        return Array.isArray(resume?.html) ? resume.html : [];
      }

      if (type === 'coverLetter') {
        return Array.isArray(coverLetter?.html) ? coverLetter.html : [];
      }

      return [];
    }

    return Array.isArray(items) ? items : [];
  })();

  const filteredItems = listToRender.filter((item: any) => {
    if (!finalSearchTerm.trim()) return true;

    const searchLower = finalSearchTerm.toLowerCase();

    const searchableText = [
      item.clTitle,
      item.coverLetterTitle,
      item.cvTitle,
      item.htmlCVTitle,
    ]
      .filter(Boolean) // remove undefined/null
      .join(' ')
      .toLowerCase();

    return searchableText.includes(searchLower);
  });

  const handleSearch = () => {
    setFinalSearchTerm(searchTerm); // 🔥 Search only when triggered
  };

  const handleRenameDocument = async (documentId: string, newTitle: string) => {
    try {
      const endpoint =
        docState === 'saved'
          ? type === 'cv'
            ? `/students/resume/${documentId}/rename`
            : `/students/cover-letter/${documentId}/rename`
          : type === 'cv'
            ? `/students/cv/${documentId}/rename`
            : `/students/cl/${documentId}/rename`;

      await apiInstance.patch(endpoint, { title: newTitle });

      if (docState === 'saved') {
        type === 'cv'
          ? dispatch(savedStudentResumeRequest())
          : dispatch(savedStudentCoverLetterRequest());
      } else {
        refreshGeneratedDocs(type);
      }

      toast({
        title: 'Document Renamed',
        description: 'Updated name fetched successfully.',
      });
    } catch (error) {
      console.error('Rename failed:', error);
      toast({
        variant: 'destructive',
        title: 'Rename Failed',
        description: 'Could not update the document name.',
      });
      throw error;
    }
  };

  const generatedCount = Array.isArray(items) ? items.length : 0;

  const savedCount =
    type === 'cv'
      ? Array.isArray(resume?.html)
        ? resume.html.length
        : 0
      : type === 'coverLetter'
        ? Array.isArray(coverLetter?.html)
          ? coverLetter.html.length
          : 0
        : 0;

  return (
    <div className="p-6">
      <div className="flex items-center flex-wrap justify-between  mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white ">
          {title}
        </h2>

        <div className="flex gap-2 mb-4 md:mb-0">
          {type !== 'application' ? (
            <div className="flex gap-2">
              {/* GENERATED BUTTON */}
              <button
                onClick={() => {
                  setDocState('generated');
                  const params = new URLSearchParams(window.location.search);
                  params.delete('q');
                  window.history.replaceState(
                    null,
                    '',
                    `?${params.toString()}`,
                  );
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  docState === 'generated'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Generated
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    docState === 'generated'
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {generatedCount}
                </span>
              </button>

              {/* SAVED BUTTON */}
              <button
                onClick={() => {
                  setDocState('saved');
                  const params = new URLSearchParams(window.location.search);
                  params.set('q', 'saved');
                  window.history.replaceState(
                    null,
                    '',
                    `?${params.toString()}`,
                  );
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  docState === 'saved'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Saved
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    docState === 'saved'
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {savedCount}
                </span>
              </button>
            </div>
          ) : (
            // APPLICATION BUTTON (Only Generated exists here)
            <button
              onClick={() => {
                setDocState('generated');
                const params = new URLSearchParams(window.location.search);
                params.delete('q');
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                docState === 'generated'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Generated
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  docState === 'generated'
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {generatedCount}
              </span>
            </button>
          )}
        </div>
        <div className="flex items-center">
          {/* Input + X inside */}
          <div className="relative">
            <input
              type="text"
              className="p-1 pr-8 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="Search Doc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />

            {/* X Button inside input */}
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm('');
                  setFinalSearchTerm('');
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button OUTSIDE */}
          <button
            className="ml-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Update conditional rendering logic */}
      {/* {items.length === 0 ? ( */}
      {listToRender?.length === 0 ? (
        // This shows if there are NO items at all
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No{' '}
            {type === 'cv'
              ? 'CVs'
              : type === 'coverLetter'
                ? 'Cover Letters'
                : 'Applications'}{' '}
            Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {type === 'cv'
              ? 'Generate your first CV to get started'
              : type === 'coverLetter'
                ? 'Create your first cover letter to see it here'
                : 'Create your first tailored application to see it here'}
          </p>
        </div>
      ) : filteredItems?.length === 0 ? (
        // This shows if there are items, but none match the search
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your search for "{searchTerm}" did not match any documents.
          </p>
        </div>
      ) : (
        // This shows the filtered results
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
          {/* 5. Map over the filtered list */}
          {filteredItems
            .slice(0, visibleCount)
            .map((item: any, index: number) => (
              <DocumentCard
                key={item._id}
                index={index + 1}
                item={item}
                type={type}
                onDelete={onDelete}
                onDeleteSaved={onDeleteSaved}
                onRenameSaved={onRenameSaved}
                onRename={handleRenameDocument}
                onCopy={onCopy}
                onDownload={onDownload}
                copiedId={copiedId}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                // onRenameSavedCv={handleRenameSavedCV}
                docState={docState}
              />
            ))}
        </div>
      )}

      {/* Show "See More" only if not all items are visible */}
      {visibleCount < filteredItems?.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount(visibleCount + 10)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
};
