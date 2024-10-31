class DrawerComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        header {
          padding: 2px;
          border-radius: 8px; /* rounded corners */
          box-shadow: 0 0 8px black;
          height: 2rem;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        header > .drawer-icon {
          text-align: left;
          cursor: pointer;
          font-size: 25px;
          margin: 0px 25px 0px 5px ;
        }
        .drawer {
          height: 100%;
          width: 200px;
          position: fixed;
          top: 0;
          left: -200px; /* Keeps drawer hidden */
          background-color: #ffffff;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
          transition: left 0.3s ease;
          padding-top: 20px;
          z-index: 1000;
        }
        .drawer.open {
          left: 0;
        }
        .drawer a {
          text-decoration: none;
          color: #333;
          display: block;
          padding: 15px 25px;
          transition: background-color 0.3s ease;
        }
        .drawer a:hover {
          background-color: #eeeeee;
        } 
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .overlay.open {
          opacity: 1;
          visibility: visible;
        }
        .drawer-open  {
          margin-left: 200px;
        }
        .content {
          padding: 20px;
          transition: margin-left 0.3s ease;
        }
      </style>
      <header>
        <span class="drawer-icon" id="sidebar-icon">&#9776;</span>
        <div class="drawer" id="drawer">
          <a href="#">Home</a>
          <a href="#">Profile</a>
          <a href="#">Settings</a>
          <a href="#">Logout</a>
        </div>
        <div class="overlay" id="overlay"></div>
      </header>
      <main id="content">    
      </main>
    `;
    const drawerIcon = this.shadowRoot.querySelector(".drawer-icon");
    const overlay = this.shadowRoot.querySelector(".overlay");

    [drawerIcon, overlay].forEach((element) => {
      if (element) {
        element.addEventListener("click", this.toggleDrawer);
      }
      else console.error("Elements not found on page")
    });
  }
  toggleDrawer = () => {
    const drawer = this.shadowRoot.getElementById("drawer");
    const overlay = this.shadowRoot.getElementById("overlay");
    const content = this.shadowRoot.getElementById("content");

    drawer.classList.toggle("open");
    overlay.classList.toggle("open");
    content.classList.toggle("drawer-open");
  }
}
customElements.define("drawer-component", DrawerComponent);


