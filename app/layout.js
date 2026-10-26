import "./globals.css";
export const metadata = { title: "VoiceLog", description: "Talk your standup. Get a clean dev log." };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
