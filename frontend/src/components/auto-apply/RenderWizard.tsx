import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Form, FormProvider } from 'react-hook-form';

const RenderWizard = ({
  form,
  wizardStep,
  renderWizardContent,
  onSubmit,
  onInvalid,
}: any) => {
  return (
    <FormProvider {...form}>
      <Form
        control={form.control}
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      >
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
      </Form>
    </FormProvider>
  );
};

export default RenderWizard;
