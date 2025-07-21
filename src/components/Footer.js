import React from 'react';

const Footer = () => {
  const today = new Date();
  const year = today.getFullYear();
  return (
    <footer  className="container w-auto">
    <div className="text-center">
        <small>© {year} <a href="http://vacobinary.in/" traget="_blank">Highspring India</a> All Rights Reserved. </small>
    </div>
    </footer>
  );
};

export default Footer;