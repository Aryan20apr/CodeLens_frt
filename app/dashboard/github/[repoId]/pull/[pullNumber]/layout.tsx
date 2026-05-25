export default function GithubPullDiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-8 -my-6 flex h-[calc(100vh-5.25rem)] min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}
