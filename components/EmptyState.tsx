"use client";

type Props = {
  icon?: string;
  title: string;
  message: string;
  action?: React.ReactNode;
};

export default function EmptyState({ icon = "📭", title, message, action }: Props) {
  return (
    <div className="empty-state" data-testid="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
