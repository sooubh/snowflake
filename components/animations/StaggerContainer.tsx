"use client";

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: (delay = 0) => ({
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: delay
        }
    })
};

export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
};

export function StaggerContainer({ children, className = "", delay = 0 }: StaggerContainerProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            custom={delay}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Wrapper for individual items
export function StaggerItem({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}
