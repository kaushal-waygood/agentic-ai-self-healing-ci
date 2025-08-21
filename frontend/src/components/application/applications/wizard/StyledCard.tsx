import { motion } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { containerVariants } from './motion';

export const StyledCard = (props: CardProps) => (
  <motion.div variants={containerVariants}>
    <Card
      className="bg-slate-900/80 border-slate-700 backdrop-blur-sm"
      {...props}
    />
  </motion.div>
);
