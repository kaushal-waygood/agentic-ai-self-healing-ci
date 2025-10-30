'use client';

import GeneratedCV from '@/components/cv/GeneratedCV';
import apiInstance from '@/services/api';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const page = () => {
  const { id } = useParams();
  const [generatedCvOutput, setGeneratedCvOutput] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiInstance.get(`/students/cv/${id}`);
        const data = response.data.cv;
        console.log(data);
        setGeneratedCvOutput(data.cvData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  console.log('Generated CV Output:', generatedCvOutput);
  return (
    <div>
      <GeneratedCV generatedCvOutput={generatedCvOutput} />
    </div>
  );
};

export default page;
