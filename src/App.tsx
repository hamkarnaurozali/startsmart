import { useEffect, useState, type ReactNode } from 'react';
import { NewPlanDialog } from './components/PlanDialogs';
import { I18nProvider, LANGS, isLang, useI18n } from './i18n';
import { go, useRoute } from './route';
import { useStore } from './store';
import { Compare } from './views/Compare';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Plans } from './views/Plans';

const MAX_COMPARE = 3;

export default function App() {
  const store = useStore();
  return (
    <I18nProvider lang={store.lang}>
      <Shell store={store} />
    </I18nProvider>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#135D4F" />
      <path d="M8 23V17M14 23V12M20 23V15M26 23V8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Shell({ store }: { store: ReturnType<typeof useStore> }) {
  const { t, lang } = useI18n();
  const route = useRoute();
  const [newOpen, setNewOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const validCompare = compareIds.filter((id) => store.plans.some((p) => p.id === id));
  const comparePlans = validCompare.map((id) => store.plans.find((p) => p.id === id)!);

  const routeKey = route.name === 'edit' ? `edit:${route.id}` : route.name;
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [routeKey]);

  function toggleCompare(id: string) {
    setCompareIds((ids) => {
      const valid = ids.filter((x) => store.plans.some((p) => p.id === x));
      if (valid.includes(id)) return valid.filter((x) => x !== id);
      return valid.length >= MAX_COMPARE ? valid : [...valid, id];
    });
  }

  let page: ReactNode;
  if (route.name === 'dashboard') {
    page = <Dashboard plans={store.plans} onNew={() => setNewOpen(true)} />;
  } else if (route.name === 'plans') {
    page = (
      <Plans
        plans={store.plans}
        compareIds={validCompare}
        maxCompare={MAX_COMPARE}
        onToggleCompare={toggleCompare}
        onNew={() => setNewOpen(true)}
        onRename={(id, name) => store.updatePlan(id, (p) => ({ ...p, name }))}
        onDuplicate={(id) => store.duplicatePlan(id, t('planCopySuffix'))}
        onDelete={store.removePlan}
      />
    );
  } else if (route.name === 'compare') {
    page = <Compare plans={comparePlans} />;
  } else {
    const plan = store.plans.find((p) => p.id === route.id);
    page = plan ? (
      <Editor
        key={plan.id}
        plan={plan}
        saveError={store.saveError}
        onChange={(fn) => store.updatePlan(plan.id, fn)}
      />
    ) : (
      <div className="card empty">
        <p>{t('planNotFound')}</p>
        <a className="btn" href="#/plans">
          {t('editBack')}
        </a>
      </div>
    );
  }

  const active = route.name === 'edit' ? 'plans' : route.name;
  const nav: { id: 'dashboard' | 'plans' | 'compare'; href: string; label: string; icon: string }[] = [
    { id: 'dashboard', href: '#/', label: t('navHome'), icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
    { id: 'plans', href: '#/plans', label: t('navPlans'), icon: 'M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01' },
    { id: 'compare', href: '#/compare', label: t('navCompare'), icon: 'M6 20V10M12 20V4M18 20v-7' },
  ];

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        {t('skipToContent')}
      </a>
      <header className="topbar">
        <div className="topbar-in">
          <a className="brand" href="#/">
            <Logo />
            <span>StartSmart</span>
          </a>
          <nav className="nav" aria-label="StartSmart">
            {nav.map((n) => (
              <a key={n.id} href={n.href} aria-current={active === n.id ? 'page' : undefined}>
                <NavIcon d={n.icon} />
                <span>{n.label}</span>
              </a>
            ))}
          </nav>
          <div className="lang no-print">
            <label htmlFor="lang-select" className="sr-only">
              {t('language')}
            </label>
            <select
              id="lang-select"
              className="control"
              value={lang}
              onChange={(e) => isLang(e.target.value) && store.setLang(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="shell">
        {store.saveError && route.name !== 'edit' && <div className="notice bad">{t('storageError')}</div>}
        {page}
      </main>

      <footer className="shell footer">
        <div className="notice">
          <strong>{t('disclaimerTitle')}</strong>
          <p>{t('disclaimerBody')}</p>
          <p>{t('privacyNote')}</p>
          {lang !== 'en' && <p>{t('translationNotice')}</p>}
        </div>
      </footer>

      {newOpen && (
        <NewPlanDialog
          onClose={() => setNewOpen(false)}
          onCreate={(name, type, sample) => {
            const id = store.addPlan(name, type, sample);
            setNewOpen(false);
            go(`/plan/${encodeURIComponent(id)}`);
          }}
        />
      )}
    </>
  );
}
