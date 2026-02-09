import { getTenant } from '../../tenant/tenant.server';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

// Define the interface for props if needed
interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = "MyBrand" }) => {

    // const useQuery() = getTenant()
    const {data: tenant} = useQuery({
        queryKey: ['tenant'],
        queryFn:()=> getTenant()
    })

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>{tenant?.name}</div>
      <ul style={styles.navLinks}>
        <li><a href="/" style={styles.link}>Home</a></li>
        <li><a href="/about" style={styles.link}>About</a></li>
        <li><a href="/contact" style={styles.link}>Contact</a></li>
      </ul>
    </nav>
  );
};

// Inline styles for simplicity
const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: '#fff',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    listStyle: 'none',
    gap: '20px',
    margin: 0,
    padding: 0,
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
  }
};

export default Navbar;
