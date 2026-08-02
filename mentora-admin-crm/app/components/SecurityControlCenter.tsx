import { securityControlGroups } from "./adminConfig";
import { AdminIcon as Icon } from "./AdminIcon";

export function SecurityControlCenter({
  runAction,
}: {
  runAction: (label: string) => Promise<void>;
}) {
  return (
    <section className="security-control-center" aria-label="Security controls">
      <div className="security-control-head">
        <div>
          <span className="eyebrow">Security Control Center</span>
          <h3>Access, identity, data protection, and compliance</h3>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            void runAction("Load Policy");
          }}
          type="button"
        >
          <Icon name="shield" />
          Load Organization Policy
        </button>
      </div>
      <div className="security-control-grid">
        {securityControlGroups.map((group) => (
          <article className="security-control-card" key={group.title}>
            <div className="security-control-card-head">
              <Icon name={group.icon} />
              <div>
                <span>{group.title}</span>
                <strong>{group.metric}</strong>
              </div>
            </div>
            <p>{group.description}</p>
            <div className="security-control-actions">
              {group.actions.map((action) => (
                <button
                  className="btn btn-light btn-sm"
                  key={action}
                  onClick={() => {
                    void runAction(action);
                  }}
                  type="button"
                >
                  {action}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

