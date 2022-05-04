// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");

let mainWindow;
let BLEDevicesWindow;
let BLEDevicesList = [];

let callbackForBluetoothEvent = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    minWidth: 1200,
    minHeight: 1000,
    title: "DataBelt",
    fullscreenable: false,

    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#141a50",
      symbolColor: "#ffffff",
      height: 29,
    },

    autoHideMenuBar: true,

    icon: "images/icon/icon512.png",
    // webPreferences: {
    //   preload: path.join(__dirname, "preload.js"),
    // },
  });

    mainWindow.webContents.on(
      "select-bluetooth-device",
      (event, deviceList, callback) => {
        event.preventDefault(); // do not choose the first one

        if (deviceList && deviceList.length > 0) {
          // find devices?
          deviceList.forEach((element) => {
            if (
              !element.deviceName.includes(
                // reduce noise by filter Devices without name
                "Unbekanntes oder nicht unterstütztes Gerät" // better use filter options in renderer.js
              ) &&
              !element.deviceName.includes("Unknown or Unsupported Device") // better use filter options in renderer.js
            ) {
              if (BLEDevicesList.length > 0) {
                // BLEDevicesList not empty?
                if (
                  BLEDevicesList.findIndex(
                    // element is not already in BLEDevicesList
                    (object) => object.deviceId === element.deviceId
                  ) === -1
                ) {
                  BLEDevicesList.push(element);
                  // console.log(BLEDevicesList);
                }
              } else {
                BLEDevicesList.push(element);
                // console.log(BLEDevicesList);
                if (!BLEDevicesWindow) {
                  createBLEDevicesWindow(); // open new window to show devices
                }
              }
            }
          });
        }

        callbackForBluetoothEvent = callback; // to make it accessible outside https://technoteshelp.com/electron-web-bluetooth-api-requestdevice-error/
      }
    );

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  //   mainWindow.maximize()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function createBLEDevicesWindow() {
  BLEDevicesWindow = new BrowserWindow({
    width: 300,
    height: 400,
    parent: mainWindow,
    title: "Bluetooth Devices near by",
    modal: true,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#141a50",
      symbolColor: "#ffffff",
      height: 29,
    },
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "BLEDevicesPreload.js"), // use a preload script
    },
  });

  BLEDevicesWindow.loadFile("BLEDevicesWindow.html");

  BLEDevicesWindow.on("close", function () {
    BLEDevicesWindow = null;
    callbackForBluetoothEvent("");
    BLEDevicesList = [];
  });
}

ipcMain.on("toMain", (event, args) => {
  console.log(args);
});

ipcMain.on("BLEScannFinished", (event, args) => {
  // console.log(args);
  console.log(BLEDevicesList.find((item) => item.deviceId === args));
  let BLEDevicesChoosen = BLEDevicesList.find((item) => item.deviceId === args);
  if (BLEDevicesChoosen) callbackForBluetoothEvent(BLEDevicesChoosen.deviceId);
  else callbackForBluetoothEvent("");
  BLEDevicesList = [];
});

ipcMain.on("getBLEDeviceList", (event, args) => {
  if (BLEDevicesWindow) {
    BLEDevicesWindow.webContents.send("BLEDeviceList", BLEDevicesList);
  }
});