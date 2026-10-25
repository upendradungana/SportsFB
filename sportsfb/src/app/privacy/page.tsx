import { PageFrame } from "../page-frame";

export default function PrivacyPage() {
  return <PageFrame title="Your privacy" eyebrow="YOUR DATA, YOUR CALL" description="A clear note about what this local demo stores."><div className="info-card"><span className="info-mark">♧</span><h2>Stored on this device.</h2><p>Posts, likes, saved posts, follows, community memberships, schedule reminders, comments, and profile settings are saved in this browser’s local storage. They are not sent to a server by this demo.</p><p>Clearing this browser’s site data removes the saved demo content. This app does not include account sign-in or cross-device sync yet.</p></div></PageFrame>;
}
