import React from 'react';
import { Layout } from './components/Layout';
import { useStore } from './lib/store';
import { InputPage } from './pages/InputPage';
import OverviewPage from './pages/OverviewPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { DueDiligencePage } from './pages/DueDiligencePage';
import { SavingsLeversPage } from './pages/SavingsLeversPage';
import { ComparisonPage } from './pages/ComparisonPage';

export default function App() {
  const activePage = useStore(s => s.activePage);

  return (
    <Layout>
      {activePage === 'overview'     && <OverviewPage />}
      {activePage === 'inputs'       && <InputPage />}
      {activePage === 'scenarios'    && <ScenariosPage />}
      {activePage === 'duediligence' && <DueDiligencePage />}
      {activePage === 'savings'      && <SavingsLeversPage />}
      {activePage === 'comparison'   && <ComparisonPage />}
    </Layout>
  );
}
