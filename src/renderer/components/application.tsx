import CreateClipping from "./create-clipping";
import Clipping from "./clipping";
import { useClippings } from "../use-clipping";
import CopyFromClipboard from "./copy-from-clipboard";

const Application = () => {
  const { clippings, addClipping, removeClipping } = useClippings();

  return (
    <main className="flex flex-col w-screen h-screen">
      <header
        className="flex shrink-0 items-center h-8 font-semibold text-white bg-primary-400"
        id="title-bar"
      >
        <h1 className="w-full text-center">Clipmaster</h1>
      </header>
      <CreateClipping onSubmit={addClipping} />
      <section className="flex min-h-0 flex-1 flex-col gap-2 p-4 overflow-y-auto">
        {clippings.map((clipping) => (
          <Clipping
            key={clipping.id}
            id={clipping.id}
            value={clipping.value}
            onRemove={removeClipping}
            onCopy={() => window.api.writeToClipboard(clipping.value)}
          />
        ))}
      </section>
      <CopyFromClipboard
        onClick={async () => {
          const content = await window.api.readFromClipboard();
          addClipping(content);
        }}
      />
    </main>
  );
};

export default Application;
