import { useState } from "react";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import { CampaignList } from "./components/CampaignList";
import { CampaignDetail } from "./components/CampaignDetail";

function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <main>
      <h1>Charity Donation Tracker</h1>
      <ConnectWalletButton />

      <h2>Campaigns</h2>
      <CampaignList selectedId={selectedId} onSelect={setSelectedId} />

      {selectedId !== null && (
        <>
          <h2>Selected campaign</h2>
          <CampaignDetail key={selectedId} campaignId={selectedId} />
        </>
      )}
    </main>
  );
}

export default App;
