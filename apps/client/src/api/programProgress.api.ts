// MOCK FOR TESTING

import type {
    ProgramProgressResponse,
} from '../../../shared/types/programProgress.types';

const USE_MOCK_PROGRAM_PROGRESS = true;

export async function getProgramProgressAPI(): Promise<ProgramProgressResponse> {
    if (USE_MOCK_PROGRAM_PROGRESS) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const requiredHours = 500;
        const wfhHours = 80;
        const onsiteHours = 100;
        const renderedHours = wfhHours + onsiteHours;
        const hoursLeft = Math.max(requiredHours - renderedHours, 0);

        return {
            message: 'Program progress fetched successfully',
            data: {
                required_hours: requiredHours,
                rendered_hours: renderedHours,
                hours_left: hoursLeft,
                wfh_hours: wfhHours,
                onsite_hours: onsiteHours,
            },
            };
    }

    throw new Error('Program progress backend is not connected yet.');
}