// ==UserScript==
// @name         yt-dlp
// @namespace    fred.vatin.yt-dlp.us
// @version      2.0.0
// @description  Run local script to run yt-dlp commands
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @author       Fred Vatin
// @updateURL    https://raw.githubusercontent.com/Fred-Vatin/run-yt-dlp-from-browser/main/user%20script/ytdl.user.js
// @downloadURL  https://raw.githubusercontent.com/Fred-Vatin/run-yt-dlp-from-browser/main/user%20script/ytdl.user.js
// @noframes
// @include      *
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        GM_info
// @grant        window.onurlchange
// @grant        GM_setClipboard
// @license MIT
// ==/UserScript==

(() => {
  "use strict";
  const PROTOCOL = "ytdl:"; // don’t change this
  const EXCLUDE_URL_MATCH = ["accounts.youtube.com"];
  const DOWNLOAD_DIR = ""; // if you want to force another download dir then the one set in the powershell script;

  // Log the script version
  console.log(`Run ${GM_info.script.name} ${GM_info.script.version}`);

  // Try to determine if this script is run for the first time at every download action

  const URL_ORIGIN = window.location.href; // could be useful if adding more sites support later
  let URL = window.location.href;
  console.log("URL (at first loading): ", URL);

  /**==========================================================================
   * ℹ		DETECT URL CHANGE TO RE-RUN THE SCRIPT
  ===========================================================================*/
  if (window.onurlchange === null) {
    console.log("window.onurlchange is supported. Adding 'urlchange' listener.");

    window.addEventListener("urlchange", () => {
      onUrlChange("window.onurlchange");
    });
  } else {
    console.log("window.onurlchange is not supported by this browser this Tampermonkey version.");
  }

  // Function to run when URL change
  function onUrlChange(event = "first loading") {
    const currentUrl = window.location.href;
    console.log(`onUrlChange call by event: ${event}`);

    if (currentUrl !== URL) {
      console.log("URL changed : ", currentUrl);
      URL = currentUrl;

      createButton();
    }
  }

  // Call these functions immediately on the initial page load
  onUrlChange();
  createButton();

  /**==========================================================================
  * ℹ		BUILD URL PROTOCOL ytdl:
  ===========================================================================*/
  function isUrlExcluded(url) {
    // Checks if the URL matches any of the elements in the excludeUrlMatch array
    return EXCLUDE_URL_MATCH.some((e) => url.includes(e));
  }

  // Function to open the URL ytdl:
  function openYtdlURL(type, quality = "", copy = false) {
    URL = window.location.href;
    console.log("URL: ", URL);

    if (isUrlExcluded(URL)) {
      const ERRMSG = `yt-dlp: url “${URL}” is excluded from processing because of "excludeUrlMatch".`;

      console.info(ERRMSG);

      GM_notification({
        text: ERRMSG,
        title: "URL EXCLUDED",
        silent: false,
        timeout: 6000,
        onclick: (event) => {
          // The userscript is still running, so don't open any url when clicked
          event.preventDefault();
          // Display an alert message instead
          console.info("User clicked the notification");
        },
      });

      return;
    }

    let ytdlURL = `${PROTOCOL}?type=${type}`;

    // Array to collect query parameters
    const params = [];
    if (quality) params.push(`&quality=${quality}`);
    if (DOWNLOAD_DIR) params.push(`&dldir=${DOWNLOAD_DIR}`);

    // Join parameters with '&' and append to URL
    ytdlURL += params.join("");
    ytdlURL += `&url=${URL}`;

    // For test purpose, copy the command to the clipboard
    if (copy) {
      GM_setClipboard(ytdlURL, "text");
      GM_notification({
        text: `Command send to the clipboard, Type: ${type}\nQuality: ${quality}`,
        title: "YT-DLP",
        silent: false,
        timeout: 6000,
        onclick: (event) => {
          // The userscript is still running, so don't open any url when clicked
          event.preventDefault();
          // Display an alert message instead
          console.info("User clicked the notification");
        },
      });
    } else {
      // This should trigger the ytdl: protocol handler if installed properly on the OS
      window.location.href = ytdlURL;
      console.info(`Try to open URL : ${ytdlURL}`);
      GM_notification({
        text: `Type: ${type}\nQuality: ${quality}`,
        title: "YT-DLP",
        silent: false,
        timeout: 6000,
        onclick: (event) => {
          // The userscript is still running, so don't open any url when clicked
          event.preventDefault();
          // Display an alert message instead
          console.info("User clicked the notification");
        },
      });

      // Try to close this tab right after triggering the download.
      // Note: the PowerShell download runs as a separate local process with no
      // way to report success/failure back to the browser, so we can't wait
      // for confirmation - we close as soon as the protocol handler is triggered.
      // Browsers only allow scripts to close tabs they opened themselves, so on
      // a tab you navigated to normally this will silently do nothing.
      setTimeout(() => {
        console.info("Attempting to close this tab after triggering download");
        window.close();
      }, 300);
    }
  }

  /**==========================================================================
  * ℹ		TAMPERMONKEY MENU CREATION
  ===========================================================================*/

  // Register those commands in Tampermonkey menu
  GM_registerMenuCommand("Download auto (recommanded)", () => openYtdlURL("auto"), {
    accessKey: "r",
    title: "Shortkey: R. Try to download the best video or audio (avc1+m4a) streams available.",
  });

  GM_registerMenuCommand("Download audio", () => openYtdlURL("audio"), {
    accessKey: "a",
    title: "Shortkey: A. Try to download the best audio (m4a) streams available.",
  });

  GM_registerMenuCommand("Download mp3", () => openYtdlURL("audio", "forceMp3"), {
    accessKey: "m",
    title: "Shortkey: M. Extract or convert to mp3",
  });

  GM_registerMenuCommand("Download 1080p", () => openYtdlURL("video", "1080"), {
    title: "Download at 1080p max if possible",
  });

  GM_registerMenuCommand("Download Best Video", () => openYtdlURL("video", "best"), {
    title: "Download the best streams it founds",
  });

  GM_registerMenuCommand("Download with YDL-UI", () => openYtdlURL("showUI"), {
    accessKey: "u",
    title: "Shortkey: U. Download with YDL-UI.exe if installed",
  });

  GM_registerMenuCommand("List formats", () => openYtdlURL("test"), {
    accessKey: "f",
    title: "Shortkey: F. Show URL details in terminal.",
  });

  GM_registerMenuCommand("Send command to clipboard (test)", () => openYtdlURL("auto", "", true), {
    accessKey: "c",
    title: "Shortkey: C. Copy command to clipboard.",
  });

  /**==========================================================================
  * ℹ		CREATE BUTTON on YouTube
  ===========================================================================*/
  function createButton(del = false) {
    let isButtonCreated = false; // to avoid multicreation
    let isYoutube = false;
    let isMusic = false;
    let functionCall = 1;
    const containerID = "ytdl-button";
    const menuID = "ytdl-menu-popup";

    const ytdlContainerObserver = new MutationObserver(() => {
      if (!del) {
        console.log("Global mutation detected, running createYtdlButton()");
        createYtdlButton();
      } else {
        console.log("Global mutation detected, running deleteButton()");
        deleteButton(containerID);
      }
    });

    ytdlContainerObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    function createYtdlButton() {
      console.log("createYtdlButton() call:", functionCall++);

      // update url
      URL = window.location.href;

      isYoutube = URL.startsWith("https://www.youtube.com/watch?v=");
      isMusic = URL.startsWith("https://music.youtube.com/watch?v=");

      console.log(`with url: ${URL}`);
      console.log(`isYouTube: ${isYoutube}, isMusic: ${isMusic}`);

      if (!isYoutube && !isMusic) {
        console.log(
          "Button cannot be created because URL doesn't match YouTube or YouTube Music or a video is not playing"
        );
        deleteButton(containerID);
        return;
      }

      const targetSelectors = [".ytp-right-controls-left", "ytmusic-nav-bar > #right-content"];

      // Find first target element
      let targetElement = null;
      for (const selector of targetSelectors) {
        targetElement = document.querySelector(selector);
        if (targetElement) break;
      }

      // If none target element is found, stop
      if (!targetElement) {
        console.log("No element in the page to insert the button");
        return;
      }

      // Check if button already exists
      if (isButtonCreated || document.querySelector(`#${containerID}`)) {
        console.log(`The button #${containerID} already exists`);
        ytdlContainerObserver.disconnect();
        return;
      }

      // Mark button as created
      isButtonCreated = true;
      ytdlContainerObserver.disconnect();

      // Create button container
      const buttonContainer = document.createElement("div");
      buttonContainer.id = containerID;

      // Quick-action button: download audio directly, no menu
      const audioButton = document.createElement("button");
      audioButton.id = "ytdl-audio-button";
      audioButton.type = "button";
      audioButton.title = "Download audio with yt-dlp";

      const audioSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      audioSvg.setAttribute("viewBox", "0 0 24 24");
      audioSvg.setAttribute("style", "width: 20px; height: 20px; fill: currentColor;");

      const audioSvgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      audioSvgPath.setAttribute("d", "M12 3v10.55A4 4 0 1014 17V7h4V3h-6z");

      audioSvg.appendChild(audioSvgPath);
      audioButton.appendChild(audioSvg);

      audioButton.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("Audio quick-download button clicked");
        openYtdlURL("audio");
      });

      // Menu-toggle button, built as a plain player control button (matches
      // .ytp-button siblings like play/settings/fullscreen; YouTube's Polymer
      // custom elements like <yt-icon-button> are not hydrated inside the
      // native HTML5 player controls, so we can't rely on them here).
      const iconButton = document.createElement("button");
      iconButton.id = "button";
      iconButton.type = "button";
      iconButton.className = "ytp-button";
      iconButton.title = "Download with yt-dlp";

      const menuIconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      menuIconSvg.setAttribute("height", "24");
      menuIconSvg.setAttribute("viewBox", "0 0 24 24");
      menuIconSvg.setAttribute("width", "24");

      const menuIconPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      menuIconPath1.setAttribute("d", "M19 15v4H5v-4H3v6h18v-6h-2z");
      menuIconPath1.setAttribute("fill", "#ff0033");

      const menuIconPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      menuIconPath2.setAttribute("d", "M12 14l-7-7h14l-7 7z");
      menuIconPath2.setAttribute("fill", "#ffffff");

      menuIconSvg.appendChild(menuIconPath1);
      menuIconSvg.appendChild(menuIconPath2);
      iconButton.appendChild(menuIconSvg);

      // Popup Menu
      const menuPopup = document.createElement("div");
      menuPopup.id = menuID;
      menuPopup.className = "ytdl-menu-hidden";

      // Configuration of menu entries with arguments for openYtdlURL(type, quality, copy)
      const menuEntries = [
        {
          text: "Download Audio (Best)",
          args: ["audio"]
        },
        {
          text: "Download Video (Best)",
          args: ["video", "best"]
        },
        {
          text: "Download Auto (avc1+m4a or best)",
          args: ["auto"]
        },
        {
          text: "Download Audio (MP3)",
          args: ["audio", "forceMp3"]
        },
        {
          text: "List formats",
          args: ["test"]
        },
        {
          text: "Copy Command (Auto)",
          args: ["auto", "", true]
        }
      ];

      // const downloadIconPath = "M17 18V19H6V18H17ZM16.5 11.4L15.8 10.7L12 14.4V4H11V14.4L7.2 10.7L6.5 11.4L11.5 16.4L16.5 11.4Z";
      const downloadIconPath = "M12 2a1 1 0 00-1 1v11.586l-4.293-4.293a1 1 0 10-1.414 1.414L12 18.414l6.707-6.707a1 1 0 10-1.414-1.414L13 14.586V3a1 1 0 00-1-1Zm7 18H5a1 1 0 000 2h14a1 1 0 000-2Z";

      menuEntries.forEach(entry => {
        const item = document.createElement("div");
        item.className = "ytdl-menu-item";

        const iconWrap = document.createElement("span");
        iconWrap.className = "ytdl-menu-icon";

        const menuSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        menuSvg.setAttribute("viewBox", "0 0 24 24");
        menuSvg.setAttribute("style", "width:24px; height:24px; fill:currentColor;");

        const menuSvgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        menuSvgPath.setAttribute("d", downloadIconPath);

        menuSvg.appendChild(menuSvgPath);
        iconWrap.appendChild(menuSvg);

        const textLabel = document.createElement("span");
        textLabel.textContent = entry.text;

        item.appendChild(iconWrap);
        item.appendChild(textLabel);

        item.addEventListener("click", (e) => {
          e.stopPropagation();
          // Use spread operator to pass array elements as individual arguments
          console.log(`Click on menu entry "${entry.text}" with args: `, entry.args);

          openYtdlURL(...entry.args);
          menuPopup.classList.add("ytdl-menu-hidden");
        });

        menuPopup.appendChild(item);
      })

      // Add elements to container
      buttonContainer.appendChild(audioButton);
      buttonContainer.appendChild(iconButton);

      // Append the popup menu directly to <body> (fixed position) so it can't be
      // clipped or hidden by an "overflow"/"contain" ancestor of the button
      // (YouTube's like/dislike button group uses such containment).
      document.body.appendChild(menuPopup);

      function positionMenuPopup() {
        const rect = buttonContainer.getBoundingClientRect();
        const menuRect = menuPopup.getBoundingClientRect();
        menuPopup.style.top = `${rect.top - menuRect.height - 4}px`;
        menuPopup.style.left = `${rect.right}px`;
        menuPopup.style.transform = "translateX(-100%)";
      }

      // Add click event
      iconButton.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log('Button clicked, toggle class "ytdl-menu-hidden" to display the menu');
        const isOpening = menuPopup.classList.contains("ytdl-menu-hidden");
        menuPopup.classList.toggle("ytdl-menu-hidden");
        if (isOpening) {
          positionMenuPopup();
        }
      });

      document.addEventListener("click", () => {
        menuPopup.classList.add("ytdl-menu-hidden");
      });

      window.addEventListener("scroll", () => {
        if (!menuPopup.classList.contains("ytdl-menu-hidden")) {
          positionMenuPopup();
        }
      }, true);

      // Insert container right before the autoplay toggle if present (player controls),
      // otherwise fall back to inserting as the first child of the target element.
      const autonavToggle = targetElement.querySelector(".ytp-autonav-toggle");
      targetElement.insertBefore(buttonContainer, autonavToggle || targetElement.firstChild);

      console.log(
        `Button container #${containerID} inserted into DOM, disconnecting ytdlContainerObserver`
      );

      GM_addStyle(`
        #${containerID} {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        #ytdl-audio-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 100%;
          padding: 0;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
          opacity: 0.9;
        }
        #ytdl-audio-button:hover {
          opacity: 1;
        }

        #${menuID} {
          position: fixed;
          background: var(--yt-spec-menu-background, #282828);
          border-radius: 12px;
          padding: 8px 0;
          min-width: 220px;
          box-shadow: 0 4px 32px 0 rgba(0,0,0,0.4);
          z-index: 2000;
          overflow: hidden;
        }
        .ytdl-menu-hidden {
          display: none;
        }
        .ytdl-menu-item {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 48px;
          cursor: pointer;
          color: var(--yt-spec-text-primary, white);
          font-family: "Roboto","Arial",sans-serif;
          font-size: 14px;
        }
        .ytdl-menu-item:hover {
          background-color: var(--yt-spec-badge-chip-background, rgba(255,255,255,0.1));
        }
        .ytdl-menu-icon {
          margin-right: 16px;
          display: flex;
          align-items: center;
          color: var(--yt-spec-text-primary, white);
        }
    `);
    }

    function deleteButton(id) {
      const button = document.getElementById(id);
      if (button) {
        button.remove(); // Removes the element from the DOM
        console.log("button detected and removed");
        ytdlContainerObserver.disconnect();
      } else {
        console.log("Tried to delete the button but it seems it doesn’t exist");
        ytdlContainerObserver.disconnect();
      }
    }

  }
})();
