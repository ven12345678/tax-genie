import './globals.css';
import Navigation from './components/Navigation';

export const metadata = {
  title: 'Tax Genie',
  description: 'Your personal tax management assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
