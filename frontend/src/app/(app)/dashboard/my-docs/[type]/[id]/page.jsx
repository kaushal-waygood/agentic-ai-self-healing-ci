// app/dashboard/my-docs/[type]/[id]/page.tsx
'use client';

import GeneratedCV from '@/components/cv/GeneratedCV';
import apiInstance from '@/services/api';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import GeneratedCoverLetter from '@/components/cover-letter/components/GeneratedCoverLetter';

const DocumentPage = () => {
  const { type, id } = useParams();
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let endpoint = '';
        let responseData = null;

        // Determine the API endpoint based on document type
        switch (type) {
          case 'cv':
            endpoint = `/students/cv/${id}`;
            break;
          case 'cl':
            endpoint = `/students/cl/${id}`;
            break;
          case 'application':
            endpoint = `/students/tailored-applications/${id}`;
            break;
          default:
            throw new Error('Invalid document type');
        }

        const response = await apiInstance.get(endpoint);
        responseData = response.data;

        // Transform data based on type
        let transformedData;
        switch (type) {
          case 'cv':
            transformedData = {
              atsScore: responseData.cv?.atsScore || 85,
              cv: responseData.cv?.cvData || '',
              type: 'cv',
              ...responseData.cv,
            };
            break;
          case 'cl':
            transformedData = {
              content: responseData.cl?.clData.html || '',
              type: 'cl',
              ...responseData.coverLetter,
            };
            break;
          case 'application':
            transformedData = {
              cv: responseData.application?.tailoredCV || '',
              coverLetter: responseData.application?.tailoredCoverLetter || '',
              email: responseData.application?.applicationEmail || '',
              type: 'application',
              ...responseData.application,
            };
            break;
          default:
            transformedData = responseData;
        }

        setDocumentData(transformedData);
      } catch (error) {
        console.error('Error fetching document data:', error);
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    if (type && id) {
      fetchData();
    }
  }, [type, id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  console.log('documentData', documentData);

  // Render different components based on document type
  const renderDocument = () => {
    if (!documentData) return null;

    switch (type) {
      case 'cv':
        return <GeneratedCV generatedCvOutput={documentData} />;
      case 'cl':
        return <GeneratedCoverLetter coverLetterData={documentData.content} />;
      case 'application':
        return <GeneratedApplication applicationData={documentData} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Unknown document type</p>
            </div>
          </div>
        );
    }
  };

  return <div>{renderDocument()}</div>;
};

export default DocumentPage;
