import React from 'react';

// Optional: Define a type for props if you want to pass dynamic data
interface FooterProps {
  companyName?: string;
}

const Footer: React.FC<FooterProps> = ({ companyName = "My Website" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p>&copy; {currentYear} {companyName}. All rights reserved.</p>
        <nav style={styles.nav}>
          <a href="/about" style={styles.link}>About</a>
          <a href="/privacy" style={styles.link}>Privacy Policy</a>
          <a href="/contact" style={styles.link}>Contact</a>
        </nav>
      </div>
    </footer>
  );
};

// Simple inline styles for a "sticky-bottom" look
const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '1rem 0',
    marginTop: 'auto', // Helps push footer to bottom in flex layouts
    width: '100%',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    flexWrap: 'wrap',
  },
  nav: {
    display: 'flex',
    gap: '15px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
};

export default Footer;
