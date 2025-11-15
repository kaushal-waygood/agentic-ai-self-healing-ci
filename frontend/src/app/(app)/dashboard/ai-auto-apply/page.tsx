import React from 'react';
import MultiStepForm from '@/components/mutiform/MultiStepForm';
import '@/components/mutiform/Form.css';
import LaunchCountdown from './LanchCountDown';

import { autoPilotMetadata } from '@/metadata/metadata';

export const metadata = {
  title: autoPilotMetadata.title,
  description: autoPilotMetadata.description,
  keywords: autoPilotMetadata.keywords,
};

function App() {
  return (
    <div className="App">
      <MultiStepForm />
      {/* <LaunchCountdown /> */}
    </div>
  );
}

export default App;
