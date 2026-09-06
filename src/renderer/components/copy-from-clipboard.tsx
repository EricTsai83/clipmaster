import clsx from 'clsx';
import type { ComponentProps } from 'react';

const CopyFromClipboard = ({
  className,
  ...props
}: ComponentProps<'button'>) => {
  return (
    <div className="flex shrink-0 border-b-2 shadow-md border-primary-700">
      <button
        disabled={!props.onClick}
        className={clsx('flex-1 w-full rounded-none text-white', className)}
        {...props}
      >
        Copy from Clipboard
      </button>
    </div>
  );
};

export default CopyFromClipboard;
