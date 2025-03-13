import { createLazyFileRoute } from "@tanstack/react-router";
import { RenamePanel } from "../components/RenamePanel";

export const Route = createLazyFileRoute("/")({
  component: () => <Index />,
});

function Index() {

  return <div>
    <RenamePanel />
  </div>;
}
