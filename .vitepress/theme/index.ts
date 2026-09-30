import DefaultTheme from 'vitepress/theme'
import PomHome from './PomHome.vue'
import Shot from './Shot.vue'
import Keys from './Keys.vue'
import AppShot from './app/AppShot.vue'
import HeroWindow from './app/HeroWindow.vue'
import ServicesPanel from './app/ServicesPanel.vue'
import ServiceTab from './app/ServiceTab.vue'
import DatabasePanel from './app/DatabasePanel.vue'
import TableView from './app/TableView.vue'
import AgentPopover from './app/AgentPopover.vue'
import SideAgentBar from './app/SideAgentBar.vue'
import UsageCard from './app/UsageCard.vue'
import UsageChart from './app/UsageChart.vue'
import WorkspacesList from './app/WorkspacesList.vue'
import WorkspaceCreate from './app/WorkspaceCreate.vue'
import Onboarding from './app/Onboarding.vue'
import GitPanel from './app/GitPanel.vue'
import DiffView from './app/DiffView.vue'
import ContextMenu from './app/ContextMenu.vue'
import TerminalView from './app/TerminalView.vue'
import TabBar from './app/TabBar.vue'
import CodeView from './app/CodeView.vue'
import DevRequests from './app/DevRequests.vue'
import ModuleStore from './app/ModuleStore.vue'
import CreateWorkspaceForm from './app/CreateWorkspaceForm.vue'
import './custom.css'

// Default theme, restyled (custom.css), a bespoke landing (PomHome), and the app's own UI drawn in
// HTML (./app) for docs pages to show instead of screenshots.
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('PomHome', PomHome)
    app.component('Shot', Shot)
    app.component('Keys', Keys)
    for (const [name, component] of Object.entries({ AppShot, HeroWindow, ServicesPanel, ServiceTab, DatabasePanel, TableView, AgentPopover, SideAgentBar, UsageCard, UsageChart, WorkspacesList, WorkspaceCreate, Onboarding, GitPanel, DiffView, ContextMenu, TerminalView, TabBar, CodeView, DevRequests, ModuleStore, CreateWorkspaceForm })) app.component(name, component)
  },
}
