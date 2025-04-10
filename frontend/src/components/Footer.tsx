import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Make sure this matches your file name

const Footer: React.FC = () => {
  return (
    <footer className="footer-fixed">
      <h6>
        CineNiche —{' '}
        <Link to="/privacy" className="footer-link">
          Privacy Policy
        </Link>
      </h6>
    </footer>
  );
};

export default Footer;
