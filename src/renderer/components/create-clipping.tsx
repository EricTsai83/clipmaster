import { useRef, useState } from 'react';

type CreateClippingProps = {
  onSubmit: (value: string) => void;
};

const CreateClipping = ({ onSubmit }: CreateClippingProps) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
        setValue('');
        ref.current?.focus();
      }}
      className="flex shrink-0 border-b-2 shadow-md border-primary-700"
    >
      <label className="sr-only" htmlFor="new-clipping">New Clipping</label>
      <input
        value={value}
        className="min-w-0 flex-1 border-none"
        placeholder='Type a new clipping and press "Enter" to save'
        id="new-clipping"
        ref={ref}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        disabled={!value}
        className="shrink-0 rounded-none"
      >
        Save to Clipboard
      </button>
    </form>
  );
};

export default CreateClipping;
