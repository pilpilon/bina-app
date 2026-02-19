import { Zap, BookOpen, Calculator, PenTool } from 'lucide-react';

export interface SimulationChapter {
    id: string;
    title: string;
    type: 'verbal' | 'quantitative' | 'english';
    duration: number; // in seconds (20 mins = 1200)
    questionCount: number;
    icon: any;
}

export const SIMULATION_STRUCTURE: SimulationChapter[] = [
    {
        id: 'chap_1',
        title: 'חשיבה מילולית - פרק 1',
        type: 'verbal',
        duration: 1200,
        questionCount: 20,
        icon: PenTool
    },
    {
        id: 'chap_2',
        title: 'חשיבה כמותית - פרק 1',
        type: 'quantitative',
        duration: 1200,
        questionCount: 20,
        icon: Calculator
    },
    {
        id: 'chap_3',
        title: 'אנגלית - פרק 1',
        type: 'english',
        duration: 1200,
        questionCount: 20,
        icon: BookOpen
    },
    {
        id: 'chap_4',
        title: 'חשיבה מילולית - פרק 2',
        type: 'verbal',
        duration: 1200,
        questionCount: 20,
        icon: PenTool
    },
    {
        id: 'chap_5',
        title: 'חשיבה כמותית - פרק 2',
        type: 'quantitative',
        duration: 1200,
        questionCount: 20,
        icon: Calculator
    },
    {
        id: 'chap_6',
        title: 'אנגלית - פרק 2',
        type: 'english',
        duration: 1200,
        questionCount: 20,
        icon: BookOpen
    },
    {
        id: 'chap_7',
        title: 'חשיבה מילולית - פרק 3 (פיילוט)',
        type: 'verbal',
        duration: 1200,
        questionCount: 20,
        icon: Zap
    },
    {
        id: 'chap_8',
        title: 'חשיבה כמותית - פרק 3 (פיילוט)',
        type: 'quantitative',
        duration: 1200,
        questionCount: 20,
        icon: Zap
    }
];

export const MINI_SIMULATION_STRUCTURE = SIMULATION_STRUCTURE.slice(0, 3);
