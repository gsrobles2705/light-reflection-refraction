import { useMemo } from 'react'
import PointerGlow from './components/PointerGlow.jsx'
import { IS_DEV } from './config/runtime.js'
import { visibleNavItems } from './content/navigation.js'
import { visibleTeam } from './content/team.js'
import ApplicationsSection from './features/applications/ApplicationsSection.jsx'
import ComparisonSection from './features/comparison/ComparisonSection.jsx'
import ConclusionsSection from './features/conclusions/ConclusionsSection.jsx'
import ExperimentSection from './features/experiment/ExperimentSection.jsx'
import Hero from './features/hero/Hero.jsx'
import HistorySection from './features/history/HistorySection.jsx'
import Footer from './features/layout/Footer.jsx'
import Header from './features/layout/Header.jsx'
import RouteMap from './features/layout/RouteMap.jsx'
import PresentBar from './features/present/PresentBar.jsx'
import PrismLabSection from './features/prism-lab/PrismLabSection.jsx'
import ProblemsSection from './features/problems/ProblemsSection.jsx'
import ReferencesSection from './features/references/ReferencesSection.jsx'
import SimulatorSection from './features/simulator/SimulatorSection.jsx'
import TeamSection from './features/team/TeamSection.jsx'
import TheorySection from './features/theory/TheorySection.jsx'
import { useTheme } from './hooks/useTheme.js'

/**
 * Page composition. The order of the sections below must match `NAV_ITEMS` (content/navigation.js): that list drives
 * the header, the footer and the presentation mode. Each section is a self-contained feature under `features/`.
 */
export default function App() {
  const { theme, toggleTheme } = useTheme()
  const team = useMemo(() => visibleTeam(IS_DEV), [])
  const navItems = useMemo(() => visibleNavItems(team.length > 0), [team])

  return (
    <>
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <PointerGlow />
      <Header items={navItems} theme={theme} onToggleTheme={toggleTheme} />
      <RouteMap items={navItems} />
      <PresentBar />

      <main>
        <Hero theme={theme} />
        {team.length > 0 && <TeamSection team={team} />}
        <HistorySection />
        <TheorySection />
        <ComparisonSection />
        <PrismLabSection />
        <ApplicationsSection />
        <ExperimentSection />
        <SimulatorSection theme={theme} />
        <ProblemsSection />
        <ConclusionsSection />
        <ReferencesSection />
      </main>

      <Footer navItems={navItems} team={team} />
    </>
  )
}
