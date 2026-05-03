import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Six Point — Admin',
  description: 'Six Point Jiu-Jitsu Admin Portal',
  icons: { icon: '/logo.webp', apple: '/logo.webp' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c1c',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0ede8',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
