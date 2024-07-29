class sideDrawer extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({mode: 'open'});

        this.shadowRoot.innerHTML = `
        <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
          z-index: 1000;
        }

        .drawer {
          position: fixed;
          background: white;
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1001;
          outline: none;
        }

        .left {
          top: 0;
          left: -500px;
          height: 100%;
          width: 500px;
        }

        .left.open {
          transform: translateX(500px);
        }

        .bottom {
          bottom: -500px;
          height: 500px;
          width: 100%;
          left: 0;
        }

        .bottom.open {
          transform: translateY(-500px);
        }

        .drawer-js-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        .drawer-js-overlay.visible {
          opacity: 1;
          pointer-events: all;
        }

        ::slotted(#closeDrawer) {
          background: none;
          border: none;
          font-size: 30px;
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
        }
      </style>
       <div class="drawer-js-overlay"></div>
       <div class="drawer">
       <slot name="content"></slot>
       </div>    
        `;
    }

    connectedCallback(){
        this.overlay = this.shadowRoot.querySelector('.drawer-js-overlay');
        this.closeButton = this.querySelector('#closeDrawer');
        this.drawer = this.shadowRoot.querySelector('.drawer');

        this.overlay.addEventListener('click', this._closeDrawer.bind(this));
        this.closeButton.addEventListener('click', this._closeDrawer.bind(this));
        // Determine drawer position based on screen size
        this._setDrawerPosition();
        window.addEventListener('resize', this._setDrawerPosition.bind(this));
    }

    _setDrawerPosition() {
      const isSmallScreen = window.innerWidth <= 768;
  
      if (isSmallScreen) {
        this.drawer.classList.remove('left');
        this.drawer.classList.add('bottom');
      } else {
        this.drawer.classList.remove('bottom');
        this.drawer.classList.add('left');
      }
    }

    openDrawer() {
    this.style.display = 'block';
    this.drawer.classList.add('open');
    this.overlay.classList.add('visible');
    this.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    this.drawer.focus();
    }
    
    _closeDrawer() {
    this.drawer.classList.remove('open');
    this.overlay.classList.remove('visible');
    this.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');

    setTimeout(() => {
      this.style.display = 'none';
    }, 500); // Matches the transition duration
  }
}

customElements.define('side-drawer', sideDrawer);

document.getElementById('openDrawer').addEventListener('click', () => {
    document.getElementById('app-drawer').openDrawer();
});