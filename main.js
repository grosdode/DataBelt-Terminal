// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification
} = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");

let mainWindow;
let BLEDevicesWindow;
let BLEDevicesList = [];
let openedAccFilePath;
let openedTempFilePath;

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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
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
  if (isDev) mainWindow.webContents.openDevTools();

  if (!isDev) mainWindow.maximize();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  mainWindow.webContents.once("dom-ready", () => {
    mainWindow.webContents.send("appVersion", app.getVersion());
  });


  autoUpdater.checkForUpdatesAndNotify();//.checkForUpdates(); 

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
    if(callbackForBluetoothEvent != null)
    callbackForBluetoothEvent("");
    BLEDevicesList = [];
  });
}

autoUpdater.on("checking-for-update", () => {
  if (mainWindow) 
    mainWindow.webContents.send("updateMessage", "Checking for update...");
});
autoUpdater.on("update-available", (info) => {
  if (mainWindow)
    mainWindow.webContents.send("updateMessage", "Update available.");
});
autoUpdater.on("update-not-available", (info) => {
  if (mainWindow)
    mainWindow.webContents.send("updateMessage", "No update available.");
});
autoUpdater.on("error", (err) => {
  if (mainWindow)
    mainWindow.webContents.send("updateMessage", "Error in auto-updater. " + err);
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
  log_message +
  " (" +
  progressObj.transferred +
  "/" +
  progressObj.total +
  ")";
  if (mainWindow)
  mainWindow.webContents.send("updateMessage", log_message);
  if (mainWindow)
    mainWindow.webContents.send("updateProgress", progressObj.percent);
});

autoUpdater.on("update-downloaded", (info) => {
  if (mainWindow)
    mainWindow.webContents.send("updateMessage", "Update downloaded");
});

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

ipcMain.on("searchBLEDevices", (event, args) => {
  if (!BLEDevicesWindow) {
    createBLEDevicesWindow(); // open new window to show devices
  }
});

ipcMain.on("createSensorDocuments", () => {
  let dateNow = new Date(Date.now());
  let year = dateNow.getFullYear();
  let month = dateNow.getMonth() + 1;
  let day = dateNow.getDate();
  let hour = dateNow.getUTCHours() - dateNow.getTimezoneOffset() / 60;
  let minute = dateNow.getMinutes();
  let date =
    year +
    padZeros(month, 2) +
    padZeros(day, 2) +
    `_` +
    padZeros(hour, 2) +
    padZeros(minute, 2);

  dialog
    .showSaveDialog(mainWindow, {
      title: "Choose file for sensor data",
      defaultPath: `SensorData_${date}`,
      filters: [
        { name: "Sensor data file csv", extensions: ["csv"] },
        { name: "Sensor data file txt", extensions: ["txt"] },
      ],
    })
    .then(({ filePath }) => {
      if (filePath != "") {
        let accFilePath =
          path.dirname(filePath) + "\\acc_" + path.basename(filePath);
        let tempFilePath =
          path.dirname(filePath) + "\\temp_" + path.basename(filePath);

        console.log(accFilePath);
        console.log(tempFilePath);
        fs.writeFile(accFilePath, "", (error) => {
          if (error) {
            handleError(
              "Error while try create file: " +
                path.basename(accFilePath) +
                "\n" +
                error
            );
            console.log("error", error);
          } else {
            openedAccFilePath = accFilePath;
            fs.writeFile(tempFilePath, "", (error) => {
              if (error) {
                handleError(
                  "Error while try create file: " +
                    path.basename(tempFilePath) +
                    "\n" +
                    error
                );
                console.log("error", error);
              } else {
                openedTempFilePath = tempFilePath;
                mainWindow.webContents.send("documentCreated", 'documents created');
              }
            });
          }
        });          
      } else {
        mainWindow.webContents.send("documentCreated", "fail");
      }
    });
});

ipcMain.on("writeToAccDocument", (event, args) => {
  // console.log(args);
  if (openedAccFilePath) {
    fs.appendFile(openedAccFilePath, args, (error) => {
      if (error) {
        handleError("Error while try to write to document:\n" + error);
        console.log("error", error);
      }
    });
  } else {
    handleError("Accelerometer file path is not set");
  }
});

ipcMain.on("writeToTempDocument", (event, args) => {
  // console.log(args);
  if (openedTempFilePath) {  const window = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(window, {
    title: "Test",
    buttons: ["Yes", "No"],
    type: "info",
    message: "This is a Test",
  }).then((result) => {
    console.log(result);
  });
    fs.appendFile(openedTempFilePath, args, (error) => {
      if (error) {
        handleError("Error while try to write to document:\n" + error);
        console.log("error", error);
      }
    });
  } else {
    handleError("Temperature data file path is not set");
  }
});

ipcMain.on("reallyDFUDialog", (event, args) => {
  const window = BrowserWindow.getFocusedWindow();
  dialog
    .showMessageBox(window, {
      title: "DFU mode activation",
      buttons: ["Yes", "No"],
      type: "info",
      message:
        "Do you really want to put the device in Device " +
        "Firmware Update (DFU) mode?\nThis will reset the " +
        "device and bring it in to DFU mode until an update " +
        "is performed (e.g. with the nRF Connect app or " +
        "https://thegecko.github.io/web-bluetooth-dfu/examples/web.html) " +
        "or the device is reset by turning it off and on. ",
    })
    .then((result) => {
      console.log(result);
      if (result.response === 0) {
        mainWindow.webContents.send("performDFU", "yes");
      } else if (result.response === 1) {
        mainWindow.webContents.send("performDFU", "no");
      }
    });
});

const handleError = (message) => {
  new Notification({
    title: "Error",
    body: message,
  }).show();
};

function padZeros(nummer, digits) {
  return ([1e12] + nummer).slice(-digits);
}