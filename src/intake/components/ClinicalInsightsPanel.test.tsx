/**
 * ClinicalInsightsPanel.test.tsx
 * Comprehensive tests for Clinical Insights Panel
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClinicalInsightsPanel } from '../ClinicalInsightsPanel';

describe('ClinicalInsightsPanel', () => {
    describe('Empty State', () => {
        it('shows empty state when no zones selected', () => {
            render(<ClinicalInsightsPanel selectedZones={[]} />);
            expect(screen.getByText(/select a zone/i)).toBeInTheDocument();
        });

        it('shows Urdu empty state when language is ur', () => {
            render(<ClinicalInsightsPanel selectedZones={[]} language="ur" />);
            expect(screen.getByText(/علاقہ منتخب کریں/)).toBeInTheDocument();
        });
    });

    describe('Zone Selection Display', () => {
        it('displays selected zones', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    painIntensities={{ 'LEFT_PRECORDIAL': 7 }}
                />
            );
            expect(screen.getByText(/left chest/i)).toBeInTheDocument();
            expect(screen.getByText('7/10')).toBeInTheDocument();
        });

        it('displays multiple zones', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL', 'LEFT_ARM']}
                    painIntensities={{
                        'LEFT_PRECORDIAL': 8,
                        'LEFT_ARM': 6
                    }}
                />
            );
            expect(screen.getByText(/left chest/i)).toBeInTheDocument();
            expect(screen.getByText(/left arm/i)).toBeInTheDocument();
        });
    });

    describe('Red Flag Detection', () => {
        it('displays red flag for cardiac symptoms', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    painIntensities={{ 'LEFT_PRECORDIAL': 9 }}
                    symptoms={['diaphoresis', 'nausea']}
                />
            );
            // Red flag section should appear
            expect(screen.getByText(/red flag/i)).toBeInTheDocument();
        });

        it('shows IMMEDIATE severity for cardiac red flag', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    painIntensities={{ 'LEFT_PRECORDIAL': 9 }}
                    symptoms={['diaphoresis']}
                />
            );
            expect(screen.getByText(/immediate/i)).toBeInTheDocument();
        });

        it('displays appendicitis red flag', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['RIGHT_ILIAC']}
                    painIntensities={{ 'RIGHT_ILIAC': 8 }}
                    symptoms={['fever', 'nausea']}
                />
            );
            expect(screen.getByText(/urgent/i)).toBeInTheDocument();
        });
    });

    describe('Pattern Detection', () => {
        it('detects cardiac radiation pattern', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL', 'LEFT_ARM']}
                    painIntensities={{
                        'LEFT_PRECORDIAL': 8,
                        'LEFT_ARM': 6
                    }}
                />
            );
            expect(screen.getByText(/pattern detected/i)).toBeInTheDocument();
        });

        it('shows pattern type', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL', 'LEFT_ARM']}
                />
            );
            // Should detect radiating or radiation pattern
            expect(screen.getByText(/radiating|radiation/i)).toBeInTheDocument();
        });
    });

    describe('Differential Diagnoses', () => {
        it('displays possible conditions', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                />
            );
            expect(screen.getByText(/possible conditions/i)).toBeInTheDocument();
        });

        it('shows ranked diagnoses', () => {
            const { container } = render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                />
            );
            const ranks = container.querySelectorAll('.differential-item .rank');
            expect(ranks.length).toBeGreaterThan(0);
        });

        it('limits to top 5 differentials', () => {
            const { container } = render(
                <ClinicalInsightsPanel
                    selectedZones={['EPIGASTRIC']}
                />
            );
            const items = container.querySelectorAll('.differential-item');
            expect(items.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Internationalization', () => {
        it('displays in Urdu when language is ur', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    language="ur"
                />
            );
            expect(screen.getByText(/بایاں سینہ/)).toBeInTheDocument();
        });

        it('sets RTL direction for Urdu', () => {
            const { container } = render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    language="ur"
                />
            );
            const panel = container.querySelector('.clinical-insights-panel');
            expect(panel).toHaveAttribute('dir', 'rtl');
        });

        it('translates red flag labels to Urdu', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    painIntensities={{ 'LEFT_PRECORDIAL': 9 }}
                    symptoms={['diaphoresis']}
                    language="ur"
                />
            );
            expect(screen.getByText(/انتباہ|فوری/)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper heading structure', () => {
            const { container } = render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                />
            );
            const headings = container.querySelectorAll('h3');
            expect(headings.length).toBeGreaterThan(0);
        });

        it('provides semantic HTML structure', () => {
            const { container } = render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL', 'EPIGASTRIC']}
                />
            );
            expect(container.querySelector('.differential-list')).toBeInTheDocument();
            expect(container.querySelector('ul')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles zone with no clinical data gracefully', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['UNKNOWN_ZONE']}
                />
            );
            // Should not crash
            expect(screen.getByText(/selected zones/i)).toBeInTheDocument();
        });

        it('handles high pain intensity correctly', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    painIntensities={{ 'LEFT_PRECORDIAL': 10 }}
                />
            );
            expect(screen.getByText('10/10')).toBeInTheDocument();
        });

        it('handles zero pain intensity', () => {
            render(
                <ClinicalInsightsPanel
                    selectedZones={['LEFT_PRECORDIAL']}
                    painIntensities={{ 'LEFT_PRECORDIAL': 0 }}
                />
            );
            expect(screen.getByText('0/10')).toBeInTheDocument();
        });
    });
});

describe('Integration Tests', () => {
    it('updates insights when zones change', () => {
        const { rerender } = render(
            <ClinicalInsightsPanel selectedZones={[]} />
        );
        expect(screen.getByText(/select a zone/i)).toBeInTheDocument();

        rerender(
            <ClinicalInsightsPanel selectedZones={['LEFT_PRECORDIAL']} />
        );
        expect(screen.queryByText(/select a zone/i)).not.toBeInTheDocument();
        expect(screen.getByText(/left chest/i)).toBeInTheDocument();
    });

    it('updates red flags when intensity increases', () => {
        const { rerender } = render(
            <ClinicalInsightsPanel
                selectedZones={['LEFT_PRECORDIAL']}
                painIntensities={{ 'LEFT_PRECORDIAL': 3 }}
            />
        );
        expect(screen.queryByText(/red flag/i)).not.toBeInTheDocument();

        rerender(
            <ClinicalInsightsPanel
                selectedZones={['LEFT_PRECORDIAL']}
                painIntensities={{ 'LEFT_PRECORDIAL': 9 }}
                symptoms={['diaphoresis']}
            />
        );
        expect(screen.getByText(/red flag/i)).toBeInTheDocument();
    });
});
