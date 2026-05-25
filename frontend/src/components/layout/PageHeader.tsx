interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-text-primary tracking-tight leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-text-secondary mt-1">{description}</p>
      )}
    </header>
  );
}
