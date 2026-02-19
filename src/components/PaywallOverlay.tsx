import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const PaywallOverlay = ({ title, sub, onUpgrade, onRefer }: any) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-[50] flex flex-col items-center justify-center p-6 text-center bg-charcoal/60 backdrop-blur-md rounded-3xl"
    >
        <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center mb-6 shadow-glow-purple">
            <Zap className="w-10 h-10 text-neon-purple" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-white">{title}</h2>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed max-w-[240px]">
            {sub}
        </p>
        <div className="w-full space-y-3">
            <button
                onClick={onUpgrade}
                className="w-full py-4 bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black rounded-xl shadow-glow-blue active:scale-95 transition-all"
            >
                שדרוג עכשיו 🚀
            </button>
            <button
                onClick={onRefer}
                className="w-full py-3 bg-white/5 border border-white/10 text-text-secondary font-bold text-sm rounded-xl hover:bg-white/10 transition-all"
            >
                הזמנת חברים וקבלת ימים בחינם 🎁
            </button>
        </div>
    </motion.div>
);
