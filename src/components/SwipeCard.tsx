import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
    word: string;
    definition: string;
    example: string;
    category: string;
    onSwipeRight: () => void;
    onSwipeLeft: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ word, definition, example, category, onSwipeRight, onSwipeLeft }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const successOpacity = useTransform(x, [-150, -50], [1, 0]);
    const skipOpacity = useTransform(x, [50, 150], [0, 1]);

    const handleDragEnd = (_e: any, info: any) => {
        if (info.offset.x < -100) {
            onSwipeLeft();
        } else if (info.offset.x > 100) {
            onSwipeRight();
        }
    };

    return (
        <div className="relative w-full max-w-[360px] aspect-[3/4] perspective-1000">
            <motion.div
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 glass-card p-8 flex flex-col justify-center items-center text-center cursor-grab active:cursor-grabbing border-2 border-electric-blue/30 overflow-hidden shadow-2xl group"
            >
                {/* Dynamic direction glow */}
                <motion.div
                    style={{
                        opacity: useTransform(x, [-150, 0, 150], [0.4, 0, 0.4]),
                        backgroundColor: useTransform(x, [-150, 0, 150], ['#00D9FF', 'transparent', '#FF006E'])
                    }}
                    className="absolute inset-0 blur-3xl pointer-events-none"
                />
                {/* Indicators */}
                <motion.div style={{ opacity: successOpacity }} className="absolute top-4 left-4 text-electric-blue font-black text-2xl border-4 border-electric-blue px-4 py-2 rounded-xl -rotate-12 bg-charcoal/80">
                    יודע ✓
                </motion.div>
                <motion.div style={{ opacity: skipOpacity }} className="absolute top-4 right-4 text-neon-pink font-black text-2xl border-4 border-neon-pink px-4 py-2 rounded-xl rotate-12 bg-charcoal/80">
                    ✗ לא יודע
                </motion.div>

                <div className="bg-electric-blue/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] text-electric-blue uppercase mb-6">
                    {category}
                </div>

                <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-electric-blue to-cyber-yellow bg-clip-text text-transparent">
                    {word}
                </h2>

                <p className="text-xl text-text-secondary font-medium mb-6 leading-relaxed">
                    {definition}
                </p>

                <div className="w-full p-4 bg-white/5 rounded-xl border-l-4 border-neon-purple text-sm text-text-muted italic leading-relaxed">
                    "{example}"
                </div>
            </motion.div>
        </div>
    );
};

export default SwipeCard;
