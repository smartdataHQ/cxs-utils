/**
 * React hook for managing Event Bible cache priming
 */

import { useState, useEffect, useCallback } from 'react';
import { eventBiblePrimingService, PrimingResult } from '@/lib/event-bible-priming';

export interface EventBiblePrimingState {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    lastPriming: PrimingResult | null;
    eventsCount: number;
}

export function useEventBiblePriming() {
    const [state, setState] = useState<EventBiblePrimingState>({
        isLoading: true,
        isReady: false,
        error: null,
        lastPriming: null,
        eventsCount: 0,
    });

    // Initialize priming on mount
    useEffect(() => {
        const initializePriming = async () => {
            try {
                setState(prev => ({ ...prev, isLoading: true, error: null }));

                // Check if priming is needed
                if (eventBiblePrimingService.shouldPrime()) {
                    console.log('Priming Event Bible cache...');
                    const result = await eventBiblePrimingService.primeCache();

                    setState({
                        isLoading: false,
                        isReady: result.success,
                        error: result.success ? null : result.error || 'Priming failed',
                        lastPriming: result,
                        eventsCount: result.eventsCount,
                    });
                } else {
                    // Cache is already primed
                    const lastResult = eventBiblePrimingService.getLastPrimingResult();
                    setState({
                        isLoading: false,
                        isReady: true,
                        error: null,
                        lastPriming: lastResult,
                        eventsCount: lastResult?.eventsCount || 0,
                    });
                }
            } catch (error: any) {
                console.error('Failed to initialize Event Bible priming:', error);
                setState({
                    isLoading: false,
                    isReady: false,
                    error: error.message || 'Failed to initialize priming',
                    lastPriming: null,
                    eventsCount: 0,
                });
            }
        };

        initializePriming();
    }, []);

    // Manual refresh function (uses local data if available)
    const refresh = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const result = await eventBiblePrimingService.refreshCache();

            setState({
                isLoading: false,
                isReady: result.success,
                error: result.success ? null : result.error || 'Refresh failed',
                lastPriming: result,
                eventsCount: result.eventsCount,
            });

            return result;
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to refresh cache';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, []);

    // Reload from Airtable function (forces Airtable reload)
    const reloadFromAirtable = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const result = await eventBiblePrimingService.reloadFromAirtable();

            setState({
                isLoading: false,
                isReady: result.success,
                error: result.success ? null : result.error || 'Reload from Airtable failed',
                lastPriming: result,
                eventsCount: result.eventsCount,
            });

            return result;
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to reload from Airtable';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, []);

    // Get cache status
    const getCacheStatus = useCallback(() => {
        return eventBiblePrimingService.getCacheStatus();
    }, []);

    return {
        ...state,
        refresh,
        reloadFromAirtable,
        getCacheStatus,
    };
}