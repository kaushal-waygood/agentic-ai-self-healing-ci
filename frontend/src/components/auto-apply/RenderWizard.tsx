import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
// 1. Correct the import: Get the <Form> component from your shadcn/ui library path
import { Form } from '@/components/ui/form';
//    (You can remove FormProvider, as shadcn/ui's Form includes it)

const RenderWizard = ({
  form,
  wizardStep,
  renderWizardContent,
  onSubmit,
  onInvalid,
}: any) => {
  return (
    // 2. Use the <Form> component from shadcn/ui as the main provider
    <Form {...form}>
      {/* 3. Create a REAL HTML <form> tag and attach the submit handler here */}
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
        <AnimatePresence mode="wait">
          <motion.div
            key={wizardStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderWizardContent()}
          </motion.div>
        </AnimatePresence>
      </form>
    </Form>
  );
};

export default RenderWizard;
