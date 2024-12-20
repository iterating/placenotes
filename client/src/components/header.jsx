import React, { useEffect } from 'react';
import Drawer from './Drawer';
import './Header.css';

const Header = () => {
  useEffect(() => {
    const drawerIcon = document.querySelector(".drawer-icon");
    const overlay = document.querySelector(".overlay");

    const toggleDrawer = () => {
      document.getElementById("drawer").classList.toggle("open");
      document.getElementById("overlay").classList.toggle("open");
      document.getElementById("content").classList.toggle("drawer-open");
    };
    [drawerIcon, overlay].forEach((element) => {
      if (element) {
        element.addEventListener("click", toggleDrawer);
      } else console.error("Elements not found on page");
    });

    return () => {
      [drawerIcon, overlay].forEach((element) => {
        if (element) {
          element.removeEventListener("click", toggleDrawer);
        }
      });
    };
  }, []);

  return (
    <div>
      <header>
        <span className="drawer-icon" id="sidebar-icon">&#9776;</span>
        <Drawer/>
        <div className="overlay" id="overlay"></div>
      </header>
    </div>
  );
};

export default Header;

