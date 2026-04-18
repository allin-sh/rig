import { Button } from '@allin/ui';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Group } from './Group';
import type { ScanFile } from './scan-file';

type ScanFileListProps = {
  files: ScanFile[];
};

export const ScanFileList = ({ files }: ScanFileListProps) => {
  const groupedFiles = useMemo(() => {
    const sortedFiles = [...files].sort(
      (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
    );

    return sortedFiles.reduce<Record<string, ScanFile[]>>((acc, file) => {
      if (!acc[file.groupId]) {
        acc[file.groupId] = [];
      }

      acc[file.groupId].push(file);
      return acc;
    }, {});
  }, [files]);

  const [ignoredFilePaths, setIgnoredFilePaths] = useState<Set<string>>(
    () => new Set(),
  );

  const selectedFiles = useMemo(() => {
    return files.filter(file => !ignoredFilePaths.has(file.resolvedPath));
  }, [files, ignoredFilePaths]);

  const toggleIgnoredFile = (filePath: string) => {
    setIgnoredFilePaths(prev => {
      const next = new Set(prev);

      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }

      return next;
    });
  };

  const handleContinue = () => {
    console.log(selectedFiles);
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-semibold text-slate-900'>
            Review scanned files
          </h1>
          <p className='text-sm leading-6 text-slate-700'>
            Keep checked only the files you want to add to your workspace.
          </p>
          <p className='text-xs leading-5 text-slate-500'>
            You can always add more files or change this selection{' '}
            <span className='font-medium text-slate-700'>later</span>.
          </p>
        </div>
        <div className='flex flex-col items-start gap-2 sm:items-end'>
          <ContinueButton
            selectedFiles={selectedFiles}
            onContinue={handleContinue}
          />
        </div>
      </div>
      {Object.entries(groupedFiles).map(([groupId, groupedItems]) => (
        <Group
          key={groupId}
          groupId={groupId}
          groupedItems={groupedItems}
          ignoredFilePaths={ignoredFilePaths}
          toggleIgnoredFile={toggleIgnoredFile}
        />
      ))}
    </div>
  );
};

type ContinueButtonProps = {
  selectedFiles: ScanFile[];
  onContinue: (selectedFiles: ScanFile[]) => void;
};

const ContinueButton = ({ selectedFiles, onContinue }: ContinueButtonProps) => {
  return (
    <Button
      onClick={() => onContinue(selectedFiles)}
      className='group h-11 cursor-pointer rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:from-sky-600 hover:to-blue-700 hover:shadow-[0_14px_34px_rgba(37,99,235,0.34)]'
    >
      Continue
      <ChevronRight className='size-4 transition-transform group-hover:translate-x-0.5' />
    </Button>
  );
};
