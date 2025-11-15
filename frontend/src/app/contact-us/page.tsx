import React from 'react';
import ContactPage from './components/contactPage';
import { contactUsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: contactUsMetadata.title,
  description: contactUsMetadata.description,
  keywords: contactUsMetadata.keywords,
};

const page = () => {
  return <ContactPage />;
};

export default page;
