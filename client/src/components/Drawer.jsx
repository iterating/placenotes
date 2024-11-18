import React from "react";

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <header>
        <span className="drawer-icon" onClick={toggleDrawer}>&#9776;</span>
        <div className={`drawer ${isOpen ? "open" : ""}`}>
          <a href="/notes">Home</a>
          <a href="/notes/new">New Note</a>
          <a href="/users/account">Settings</a>
          <a href="/users/logout">Logout</a>
        </div>
        <div className={`overlay ${isOpen ? "open" : ""}`} onClick={toggleDrawer} />
      </header>

      <script>
        document.getElementById("content").classList.toggle(
          "drawer-open",
          isOpen
        );
      </script>
    </>
  );
};

export default Drawer;

