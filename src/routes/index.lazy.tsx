import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: () => <Index />,
});

function Index() {
  const navigate = useNavigate();
  navigate({ to: "/select" });
  return <div></div>;
}
