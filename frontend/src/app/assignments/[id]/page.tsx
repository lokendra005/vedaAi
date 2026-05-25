'use client';

import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { fetchAssignment, regenerateAssignment } from '@/services/api';
import type { WsMessage } from '@/types';
import { GenerationProgress } from '@/features/paper/GenerationProgress';
import { QuestionPaperView } from '@/features/paper/QuestionPaperView';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AssignmentOutputPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [regenerating, setRegenerating] = useState(false);
  const {
    currentAssignment,
    paper,
    jobStatus,
    isLoading,
    isGenerating,
    setCurrent,
    setJobStatus,
    setLoading,
    setGenerating,
  } = useAppStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAssignment(id);
      setCurrent(data.assignment, data.paper);
      setJobStatus(data.jobStatus);
      setGenerating(
        data.assignment.status === 'generating' || data.assignment.status === 'queued'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id, setCurrent, setJobStatus, setLoading, setGenerating]);

  useEffect(() => {
    load();
  }, [load]);

  const handleWs = useCallback(
    (msg: WsMessage) => {
      if (msg.payload.assignmentId !== id) return;
      switch (msg.event) {
        case 'generation_started':
          setGenerating(true);
          setJobStatus({ progress: 5, state: 'started' });
          break;
        case 'generation_progress':
          setJobStatus({
            progress: msg.payload.progress ?? 0,
            state: msg.payload.state ?? 'processing',
            error: msg.payload.error,
          });
          break;
        case 'generation_completed':
          setGenerating(false);
          setJobStatus({ progress: 100, state: 'completed' });
          toast.success('Question paper generated!');
          load();
          break;
        case 'generation_failed':
          setGenerating(false);
          setJobStatus({
            progress: 0,
            state: 'failed',
            error: msg.payload.error,
          });
          toast.error(msg.payload.error || 'Generation failed');
          break;
      }
    },
    [id, load, setGenerating, setJobStatus]
  );

  const { isConnected } = useWebSocket(id, handleWs);

  useEffect(() => {
    if (!isGenerating || isConnected) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchAssignment(id);
        if (data.assignment.status === 'completed' || data.assignment.status === 'failed') {
          setCurrent(data.assignment, data.paper);
          setJobStatus(data.jobStatus);
          setGenerating(false);
          if (data.assignment.status === 'completed') {
            toast.success('Question paper generated!');
          } else {
            toast.error(data.jobStatus?.error || 'Generation failed');
          }
        } else if (data.jobStatus) {
          setJobStatus(data.jobStatus);
        }
      } catch (err) {
        console.error('Failed to poll assignment status:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [id, isGenerating, isConnected, setCurrent, setJobStatus, setGenerating]);

  const handleRegenerate = async (scope: 'full' | 'section', sectionTitle?: string) => {
    setRegenerating(true);
    setGenerating(true);
    try {
      await regenerateAssignment(id, scope, sectionTitle);
      toast.success('Regeneration started');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Regenerate failed');
      setGenerating(false);
    } finally {
      setRegenerating(false);
    }
  };

  if (isLoading && !currentAssignment) {
    return (
      <div className="p-10 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      <Link
        href="/assignments"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to assignments
      </Link>

      {currentAssignment && (
        <h1 className="text-xl font-bold font-display">
          {currentAssignment.title}
        </h1>
      )}

      {(isGenerating || currentAssignment?.status === 'queued') && (
        <GenerationProgress
          progress={jobStatus?.progress ?? 10}
          state={jobStatus?.state ?? 'queued'}
          error={jobStatus?.error}
        />
      )}

      {paper && currentAssignment?.status === 'completed' && (
        <QuestionPaperView
          paper={paper}
          assignmentId={id}
          grade={currentAssignment.grade}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
        />
      )}

      {currentAssignment?.status === 'failed' && !paper && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-red-600 mb-4">{jobStatus?.error || 'Generation failed'}</p>
          <button
            onClick={() => handleRegenerate('full')}
            className="text-primary font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
