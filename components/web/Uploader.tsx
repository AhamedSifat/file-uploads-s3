'use client';

import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

type UploadFile = {
  id: string;
  file: File;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
};

const Uploader = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const uploadFile = async (file: File) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );

    try {
      const response = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to get presigned URL');

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file
              ? { ...f, uploading: false, progress: 0, error: true }
              : f
          )
        );
        return;
      }

      const { presignedUrl, key } = await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        uploading: false,
        progress: 0,
        isDeleting: false,
        error: false,
        objectUrl: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }

    acceptedFiles.forEach((file) => uploadFile(file));
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
    <>
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
                Drag &apos;n&apos; drop some files here, or click to select
                files
              </p>
              <Button>Select Files</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className='mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'>
          {files.map(
            ({
              id,
              file,
              uploading,
              progress,
              isDeleting,
              error,
              objectUrl,
            }) => {
              return (
                <div key={id} className='flex flex-col gap-1'>
                  <div className='relative aspect-square rounded-lg overflow-hidden'>
                    <img
                      src={objectUrl}
                      alt={file.name}
                      className='w-full h-full object-cover'
                    />

                    <Button
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2'
                      onClick={() => {}}
                      disabled={false}
                    >
                      {isDeleting ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Trash2 className='w-4 h-4' />
                      )}
                    </Button>
                    {uploading && !isDeleting && (
                      <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                        <div className='text-white font-medium text-lg'>
                          {progress}%
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className='absolute inset-0 bg-red-500/50 flex items-center justify-center'>
                        <div className='text-white font-medium'>Error</div>
                      </div>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground truncate px-1'>
                    {file.name}
                  </p>
                </div>
              );
            }
          )}
        </div>
      )}
    </>
  );
};

export default Uploader;
