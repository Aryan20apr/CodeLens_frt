export default function GithubPullDiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-8 -my-6 flex h-full min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}
