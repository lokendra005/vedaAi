'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileUpload({ file, onChange, error }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onChange(dropped);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center gap-4 rounded-3xl border-[1.75px] border-dashed border-border bg-white p-8 transition',
          dragOver && 'border-primary bg-primary/5',
          error && 'border-red-400'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-off-white">
          <Upload className="h-6 w-6 text-text-secondary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-text-primary">
            {file ? file.name : 'Choose a file or drag & drop it here'}
          </p>
          <p className="text-sm text-text-muted mt-1">PDF, TXT, JPEG, PNG — up to 10MB</p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.jpg,.jpeg,.png"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium',
              'bg-bg-off-white text-text-primary border border-border hover:bg-white transition'
            )}
          >
            Browse Files
          </span>
        </label>
      </div>
      <p className="text-sm font-medium text-primary/80">
        Upload reference material for AI context (optional)
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
