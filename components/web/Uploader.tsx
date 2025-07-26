'use client';
import { useCallback } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const Uploader = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    // Do something with the files
  }, []);

  const rejectedFiles = useCallback((rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const tooManyFiles = rejectedFiles.find(
        (file) => file.errors[0].code === 'too-many-files'
      );

      const fileTooLarge = rejectedFiles.find(
        (file) => file.errors[0].code === 'file-too-large'
      );

      if (tooManyFiles) {
        toast.error('You can only upload up to 5 files at a time.');
      }
      if (fileTooLarge) {
        toast.error('One or more files are too large. Maximum size is 10 MB.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: rejectedFiles,
    maxFiles: 5,

    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: true,

    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
  });

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
