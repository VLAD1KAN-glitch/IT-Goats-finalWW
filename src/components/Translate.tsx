import { motion, AnimatePresence } from 'motion/react';
import { useI18nStore, I18nKey } from '../store/i18nStore';

export function Translate({ i18nKey, className = "" }: { i18nKey: I18nKey, className?: string }) {
  const { lang, t } = useI18nStore();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={lang}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
        className={`inline-block ${className}`}
      >
        {t(i18nKey)}
      </motion.span>
    </AnimatePresence>
  );
}
