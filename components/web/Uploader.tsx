'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const Uploader = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64',
        isDragActive
          ? 'border-primary bg-primary/10 border-solid'
          : 'border-border hover:border-primary'
      )}
    >
      <CardContent className='flex items-center justify-center h-full w-full'>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className='text-center'>Drop the files here ...</p>
        ) : (
          <div className='flex flex-col items-center gap-y-3'>
            <p>
              Drag &apos;n&apos; drop some files here, or click to select files
            </p>
            <Button>Select Files</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Uploader;
