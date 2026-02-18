import React from 'react';
import { motion } from 'framer-motion';

interface PerformanceChartProps {
    data: { label: string; value: number; color: string }[];
    max: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, max }) => {
    return (
        <div className="space-y-6 w-full py-4">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">{item.label}</span>
                        <span className="text-sm font-black text-text-primary">{item.value}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / max) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                            className="h-full relative overflow-hidden"
                            style={{ backgroundColor: item.color }}
                        >
                            {/* Animated light streak */}
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-24 skew-x-[-20deg]"
                            />
                        </motion.div>
                        {/* Glow effect matching the bar color */}
                        <div
                            className="absolute inset-0 opacity-20 blur-md pointer-events-none"
                            style={{
                                width: `${(item.value / max) * 100}%`,
                                backgroundColor: item.color
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PerformanceChart;
