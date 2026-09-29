import { Badge } from "../../components/ui/Badge.tsx";
import { Tab, Tabs, TabsList, TabsPanel } from "../../components/ui/Tabs.tsx";

export function TabsDemo() {
  return (
    <Tabs defaultValue="activity" className="w-full max-w-xl">
      <TabsList>
        <Tab value="activity">Activity</Tab>
        <Tab value="comments">
          Comments <Badge>3</Badge>
        </Tab>
        <Tab value="related">Related</Tab>
      </TabsList>
      <TabsPanel value="activity" className="text-ink-muted">
        Status changed to Blocked 2 days ago.
      </TabsPanel>
      <TabsPanel value="comments" className="text-ink-muted">
        Three comments from the payments team.
      </TabsPanel>
      <TabsPanel value="related" className="text-ink-muted">
        CHK-101 and CHK-129 touch the same payment step.
      </TabsPanel>
    </Tabs>
  );
}
