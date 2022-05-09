const UUIDs = {
  acc: { // Accelerometer UUIDs
    service: "0000f00d-ef44-7fa8-4544-d09e246bac55",
    characteristics: {
      filter: "0000abcd-ef44-7fa8-4544-d09e246bac55",
      lpFilter: "0000ebcd-ef44-7fa8-4544-d09e246bac55",
      range: "0000bcde-ef44-7fa8-4544-d09e246bac55",
      divider: "0000cdef-ef44-7fa8-4544-d09e246bac55",
      axis: "0000bcda-ef44-7fa8-4544-d09e246bac55",
      data: "0000cdeb-ef44-7fa8-4544-d09e246bac55",
      type: "0000defc-ef44-7fa8-4544-d09e246bac55",
      resolution: "0000cdab-ef44-7fa8-4544-d09e246bac55",
      bin: "0000debc-ef44-7fa8-4544-d09e246bac55",
    },
  },
  temp: { // Temperature UUIDs
    service: "0000f00d-f044-7fa8-4544-d09e246bac55",
    characteristics: {
      divider: "00000123-f044-7fa8-4544-d09e246bac55",
      data: "00001230-f044-7fa8-4544-d09e246bac55",
    },
  },
  volt: { // Voltage UUIDs
    service: "0000f00d-f144-7fa8-4544-d09e246bac55",
    characteristics: {
      divider: "00004567-f144-7fa8-4544-d09e246bac55",
      data: "00005674-f144-7fa8-4544-d09e246bac55",
    },
  },
  info: { // Info UUIDs
    service: "0000f00d-f244-7fa8-4544-d09e246bac55",
    characteristics: {
      hardwareVersion: "00008901-f244-7fa8-4544-d09e246bac55",
      softwareVersion: "00009018-f244-7fa8-4544-d09e246bac55",
      globalDivider: "00000189-f244-7fa8-4544-d09e246bac55",
    },
  },
  dfu: { // DFU UUIDs
    service: "0000fe59-0000-1000-8000-00805f9b34fb",
    characteristics: {
      dfu: "8ec90003-f315-4f60-9fb8-838830daea50",
    }
  }
};

const DDContent = {
  ADXL372accFilters: [0, 3.96, 7.88, 15.58, 30.48],
  ADXL372accLpFilters: [200, 400, 800, 1600, 3200],
  AccRanges: [100, 200, 400],
  ADXL372Range: [' ', 200, ' '],
  PossibleAxis: ["All Axis", "X Axis", "Y Axis", "Z Axis"],
  PossibleAxisLimits: [50, 100, 200, 300, 500, 750, 1000, 1600],
  TempSampling: ["0.25", "0.5", "1", "2"],
}

const UsedAccelerometer = ["ADXL_372"];
const SensorBaseFrequency = 32768;

const TEMP_TIME_WINDOW = 2;

const TemperatureFreqSlideMin = 0.01;
const TemperatureFreqSlideMax = 100;

let IsConnected = false;
let BluetoothDevice;
let ShouldDisconnect = false;

let Characteristics = {
  acc: {
    filter: {},
    lpFilter: {},
    range: {},
    divider: {},
    axis: {},
    data: {},
    type: {},
    resolution: {},
    bin: {},
  },
  temp: {
    divider: {},
    data: {},
  },
  voltage: {
    divider: {},
    data: {},
  },
  info: {
    hardwareVersion: {},
    softwareVersion: {},
    globalDivider: {},
  },
  dfu: {
    dfu: {}
  }
};

let HardwareVersion = -1;
let SoftwareVersion = -1;

let GlobalFrequencyDivider = 20;

let AccVauleDivider = (2 ^ 11) / 200;

let LoggingActive = false;

let PeakFreq = 0;

const FftLength = 4096;
const AccUpdateDivider = 10;
let AccUpdateDividerValue = 0;
let AccData = Array.apply(null, { length: FftLength }).map(Number.call, _ => 0);
let AccDataX = Array.apply(null, { length: FftLength }).map(Number.call, _ => 0);
let AccDataY = Array.apply(null, { length: FftLength }).map(Number.call, _ => 0);
let AccDataZ = Array.apply(null, { length: FftLength }).map(Number.call, _ => 0);
let AccDataPointer = 0;
let TempTime = 0;
const TEMPERATURE_DIVIDER = 4;
let SmapleFrequencyTemp = 5;
let Temperature_time_divider = 60 / SmapleFrequencyTemp;

let TempYMin = 1000;
let TempYMax = -1000;
const TempAxisAhead = 3;


const DomEl = {
  img: {
    connectionButton: document.getElementById("img_connection"),
    HPVSettings: document.getElementById("img_HPV"),
    rangeSettings: document.getElementById("img_range"),
    axisSettings: document.getElementById("img_axis"),
    tempSettings: document.getElementById("img_temp"),
    uploadSetting: document.getElementById("img_upload_settings"),
    dfu: document.getElementById("img_dfu"),
    log: document.getElementById("img_log"),
    BLEsymbol: document.getElementById("img_BLEsymbol"),
  },
  p: {
    statusText: document.getElementById("statusText"),
    statusMag: document.getElementById("MagText"),
    toneFrequency: document.getElementById("toneFrequency"),
    trumForce: document.getElementById("trumForce"), 
  },
  span: {
    connection: document.getElementById("span_tooltip_connection"),
  },
  dropDown: {
    HPV: document.getElementById("HPVDropdownContent_ul"),
    range: document.getElementById("RangeDropdownContent_ul"),
    axis: document.getElementById("AxisDropdownContent_ul"),
    axisLimit: document.getElementById("AxisLimitDropdownContent_ul"),
    temp: document.getElementById("TempDropdownContent_ul"),
  },
  input: {
    trumLength: document.getElementById("trumLengthValue"),
    beltWeight: document.getElementById("beltWeightValue"),
  },
};

DomEl.input.trumLength.addEventListener("change", cleanPeakFreq);
DomEl.input.beltWeight.addEventListener("change", cleanPeakFreq);

const TitleFontSize = 25;
const ChartFontColor = "rgb(200, 200, 200)";
const AxisFontSize = 20;
const AxisTickFontSize = 18;

const DfuCommand = new Uint8Array(1);
DfuCommand[0] = 1;

let InitialCharacteristicRead = true;

let SmapleFrequencyAcc = 3276.8;
let DisplayFrequencyrange = (SmapleFrequencyAcc / 2);

let AccChart;
let AccChartData = new Array(FftLength / 2).fill({ x: 0, y: 0 }).map(
  (entry, index) => {
    return {
      x: index * (DisplayFrequencyrange / ((FftLength / 2) - 1)),
      y: null
    }
  }
);
let TempChart;

let CheckForBLE = new Promise(function (resolve, reject) {
  try {
    navigator.bluetooth.getAvailability()
      .then(isBluetoothAvailable => {
        resolve(isBluetoothAvailable);
      })
      .catch(error => {
        reject(Error(error));
      });

    if ('onavailabilitychanged' in navigator.bluetooth) {
      navigator.bluetooth.addEventListener('availabilitychanged', function (event) {
        resolve(event.value);
      }).catch(error => {
        reject(Error(error));
      });
    }
  } catch (error) {
    reject(Error(error));
  }
});

// The wake lock sentinel.
let WakeLock = null;

window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.log(`window.onerror:`);
  console.log('->msg:' + msg);
  console.log('->url:' + url);
  console.log('->lineNo:' + lineNo);
  console.log('->columnNo:' + columnNo);
  console.log('->error:' + error);
  return false;
}

function cleanPeakFreq() {
  PeakFreq = 0;
}

function setup() {
  draw();
  CheckForBLE.then(function (result) {
    if (result) {
      DomEl.img.connectionButton.addEventListener('click', () => handleConnection());
      initAccChart();
      initTempChart();
      setupHPVDropdownContent(DDContent.ADXL372accFilters);
      setupRangeDropdownContent(DDContent.ADXL372Range);
      setupAxisDropdownContent(DDContent.PossibleAxis);
      setupAxisLimitDropdownContent(DDContent.PossibleAxisLimits);
      DomEl.dropDown.axisLimit.style.display = "none";
      document.getElementById("img_axis_limit").addEventListener('click', showAxisLimitDropdownContent);
      setupTempDropdownContent(DDContent.TempSampling);
      DomEl.dropDown.HPV.addEventListener('click', (param) => updateChar8Bit(Characteristics.acc.filter, param.target.id.replace(/\D/g, '')));
      DomEl.dropDown.range.addEventListener('click', (param) => updateChar8Bit(Characteristics.acc.range, param.target.id.replace(/\D/g, '')));
      DomEl.dropDown.axis.addEventListener('click', (param) => updateChar8Bit(Characteristics.acc.axis, param.target.id.replace(/\D/g, '')));
      DomEl.dropDown.axisLimit.addEventListener('click', (param) => setXAxisLimit(param.target.id.replace(/\D/g, '')));
      DomEl.dropDown.temp.addEventListener('click', (param) => updateTemperatureChar(param.target.id.replace(/\D/g, '')));
    }
  }, function (err) {
    DomEl.img.connectionButton.className = 'barActionInactiveImage';
    document.getElementById('headerH1').style.display = "inherit";
    console.log(err);
  });
  
  if (!navigator.bluetooth) {
    document.getElementById('headerH1').style.display = "inherit";
  }
}

// Function that attempts to request a screen wake lock.
const requestWakeLock = async () => {
  try {
    WakeLock = await navigator.wakeLock.request('screen');
    WakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock was released');
    });
    console.log('Screen Wake Lock is active');
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};

function setXAxisLimit(dropdownID) {
  AccChart.resetZoom();
  AccChart.options.scales.xAxes[0].ticks.max = DDContent.PossibleAxisLimits[dropdownID];
  AccChart.options.scales.xAxes[0].ticks.stepSize = DDContent.PossibleAxisLimits[dropdownID] / 20;
  AccChart.update();
  localStorage.setItem('xLimit', dropdownID);
}

function loggingCallback() {
  // discard parameters
  logging();
}

window.api.receive("documentCreated", (data) => {
  if (data === 'fail') {
    logging(true)
  }
  else
  {
    DomEl.img.log.src = "images/Log_active.svg";
    LoggingActive = true;
    deactivateSettings();

    HP_Filter =
      DDContent.ADXL372accFilters[Characteristics.acc.filter.value.getUint8(0)];
    LP_Filter =
      DDContent.ADXL372accLpFilters[
        Characteristics.acc.lpFilter.value.getUint8(0)
      ];
    Range = DDContent.AccRanges[Characteristics.acc.range.value.getUint8(0)];
    Axis = DDContent.PossibleAxis[Characteristics.acc.axis.value.getUint8(0)];
    SmapleFrequencyAcc =
      SensorBaseFrequency /
      GlobalFrequencyDivider /
      Characteristics.acc.divider.value.getUint8(0);

    let headerACC =
      `log file of Accelerometer;Sample Frequenzy:;` +
      SmapleFrequencyAcc +
      `;Hz;HP Filter:;` +
      HP_Filter +
      `;Hz;LP Filter:;` +
      LP_Filter +
      `;Hz;Range:;` +
      Range +
      `;g;Axis:;` +
      Axis +
      `;Vaule Divider to get [g]:;` +
      AccVauleDivider;

    let subHeaderAcc;
    if (SoftwareVersion >= 3) {
      if (Characteristics.acc.axis.value.getUint8(0) >= 1) {
        subHeaderAcc = Axis + `;Mag;Stamp`;
      } else {
        subHeaderAcc = `x;y;z;Mag;Stamp`;
      }
    } else {
      if (Characteristics.acc.axis.value.getUint8(0) >= 1) {
        subHeaderAcc = Axis + `;Stamp`;
      } else {
        subHeaderAcc = `x;y;z;Stamp`;
      }
    }

    window.api.send("writeToAccDocument", headerACC + "\n");
    window.api.send("writeToAccDocument", subHeaderAcc + "\n");

    let headerTemp =
      `log file of Temperature Sonsor;Sample Frequenzy:;` +
      SensorBaseFrequency +
      `/` +
      Characteristics.temp.divider.value.getUint16(0, true) *
        GlobalFrequencyDivider +
      `;Hz`;
    let subHeaderTemp = `value;Stamp`;

    window.api.send("writeToTempDocument", headerTemp + "\n");
    window.api.send("writeToTempDocument", subHeaderTemp + "\n");
  }
  console.log(data);
});

function logging(abort = false) {
  if (LoggingActive) {
    DomEl.img.log.src = 'images/Log.svg';

    LoggingActive = false;
    activateSettings();
    
  } else {
    if (!abort) {
      window.api.send("createSensorDocuments", "createDocument");
    }
  }
}

function updateChar8Bit(characteristicHandle, newvalue) {
  if (characteristicHandle !== null) { 
    characteristicHandle.value.setUint8(0, parseInt(newvalue));
    characteristicHandle.writeValue(characteristicHandle.value)
    .then(() => { characteristicHandle.readValue(); });
  }
}
function updateChar16Bit(characteristicHandle, newvalue) {
  if (characteristicHandle !== null) {
    characteristicHandle.value.setUint16(0, parseInt(newvalue), true);
    characteristicHandle.writeValue(characteristicHandle.value)
      .then(() => { characteristicHandle.readValue(); });
  }
}

function updateTemperatureChar(newvalueIndex) {
  let newFrequency = parseFloat(DDContent.TempSampling[parseInt(newvalueIndex)]);
  let newDivider = SensorBaseFrequency / (GlobalFrequencyDivider * newFrequency);
  newDivider = Math.round(newDivider);
  updateChar16Bit(Characteristics.temp.divider, newDivider);
}
/************************************************************************/
// dropdown
window.onclick = function (event) {
  if (!(event.target.id === 'img_HPV')) {
    DomEl.dropDown.HPV.style.display = "none";
  }
  if (!(event.target.id === 'img_range')) {
    DomEl.dropDown.range.style.display = "none";
  }
  if (!(event.target.id === 'img_axis')) {
    DomEl.dropDown.axis.style.display = "none";
  }
  if (!(event.target.id === 'img_axis_limit')) {
    DomEl.dropDown.axisLimit.style.display = "none";
  }
  if (!(event.target.id === 'img_temp')) {
    DomEl.dropDown.temp.style.display = "none";
  }
  // console.log(event);
}

function showHPVDropdownContent() {
  if (DomEl.dropDown.HPV.style.display === "none") {
    DomEl.dropDown.HPV.style.display = "block";
  } else {
    DomEl.dropDown.HPV.style.display = "none";
  }
}

function showrangeDropdownContent() {
  if (DomEl.dropDown.range.style.display === "none") {
    DomEl.dropDown.range.style.display = "block";
  } else {
    DomEl.dropDown.range.style.display = "none";
  }
}

function showAxisDropdownContent() {
  if (DomEl.dropDown.axis.style.display === "none") {
    DomEl.dropDown.axis.style.display = "block";
  } else {
    DomEl.dropDown.axis.style.display = "none";
  }
}

function showAxisLimitDropdownContent() {
  if (DomEl.dropDown.axisLimit.style.display === "none") {
    DomEl.dropDown.axisLimit.style.display = "block";
  } else {
    DomEl.dropDown.axisLimit.style.display = "none";
  }
}

function showTempDropdownContent() {
  if (DomEl.dropDown.temp.style.display === "none") {
    DomEl.dropDown.temp.style.display = "block";
  } else {
    DomEl.dropDown.temp.style.display = "none";
  }
}

function setupHPVDropdownContent(filterlist) {
  DomEl.dropDown.HPV.innerHTML = `<li><p id="0" class="dropdownItem">off</p></li>`;
  let filterlistlength = filterlist.length;
  for (let index = 1; index < filterlistlength; index++) {
    DomEl.dropDown.HPV.innerHTML += `<li><p id="f` + index + `" class="dropdownItem">` + filterlist[index] + `Hz</p></li>`;
  }
}

function setupLPVDropdownContent(filterlist) {
  LPVDropdownContent.innerHTML = `<li><p id="4" class="dropdownItem">3200</p></li>`;
  let filterlistlength = filterlist.length;
  for (let index = 1; index < filterlistlength; index++) {
    LPVDropdownContent.innerHTML += `<li><p id="f` + index + `" class="dropdownItem">` + filterlist[index] + `Hz</p></li>`;
  }
}

function setupRangeDropdownContent(rangelist) {
  DomEl.dropDown.range.innerHTML = ``;
  let rangelistlength = rangelist.length;
  for (let index = 0; index < rangelistlength; index++) {
    if (!(rangelist[index] === ' ')) {
      DomEl.dropDown.range.innerHTML += `<li><p id="r` + index + `" class="dropdownItem">` + rangelist[index] + `g</p></li>`;
    }
  }
}

function setupAxisDropdownContent(axislist) {
  DomEl.dropDown.axis.innerHTML = ``;
  let axislistlength = axislist.length;
  for (let index = 0; index < axislistlength; index++) {
    DomEl.dropDown.axis.innerHTML += `<li><p id="a` + index + `" class="dropdownItem">` + axislist[index] + `</p></li>`;
  }
}

function setupAxisLimitDropdownContent(axisLimitlist) {
  DomEl.dropDown.axisLimit.innerHTML = ``;
  let axisLimitlistlength = axisLimitlist.length;
  for (let index = 0; index < axisLimitlistlength; index++) {
    DomEl.dropDown.axisLimit.innerHTML += `<li><p id="l` + index + `" class="dropdownItem">` + axisLimitlist[index] + ` Hz</p></li>`;
  }
}

function setupTempDropdownContent(tempSamplinglist) {
  DomEl.dropDown.temp.innerHTML = ``;
  let tempSamplinglistlength = tempSamplinglist.length;
  for (let index = 0; index < tempSamplinglistlength; index++) {
    DomEl.dropDown.temp.innerHTML += `<li><p id="t` + index + `" class="dropdownItem">` + tempSamplinglist[index] + `</p></li>`;
  }
}
/************************************************************************/

function handleConnection() {
  if (IsConnected) {
    onDisconnectButtonClick();
  } else {
    onButtonClick()
  }
}

function activateSettings() {
  DomEl.img.HPVSettings.src = 'images/HPV.svg';
  DomEl.img.rangeSettings.src = 'images/range.svg';
  DomEl.img.axisSettings.src = 'images/axis.svg';
  DomEl.img.tempSettings.src = 'images/Temp.svg';
  DomEl.img.uploadSetting.src = 'images/upload.svg';
  DomEl.img.dfu.src = 'images/dfu.svg';
  DomEl.img.HPVSettings.addEventListener('click', showHPVDropdownContent);
  DomEl.img.rangeSettings.addEventListener('click', showrangeDropdownContent);
  DomEl.img.axisSettings.addEventListener('click', showAxisDropdownContent);
  DomEl.img.tempSettings.addEventListener('click', showTempDropdownContent);
  DomEl.img.uploadSetting.addEventListener('click', uploadSettingsToSensor);
  DomEl.img.dfu.addEventListener('click', switchToDFUMode);
}

function deactivateSettings() {
  DomEl.img.HPVSettings.src = 'images/HPV_gray.svg';
  DomEl.img.rangeSettings.src = 'images/range_gray.svg';
  DomEl.img.axisSettings.src = 'images/axis_gray.svg';
  DomEl.img.tempSettings.src = 'images/Temp_gray.svg';
  DomEl.img.uploadSetting.src = 'images/upload_gray.svg';
  DomEl.img.dfu.src = 'images/dfu_gray.svg';
  DomEl.img.HPVSettings.removeEventListener('click', showHPVDropdownContent);
  DomEl.img.rangeSettings.removeEventListener('click', showrangeDropdownContent);
  DomEl.img.axisSettings.removeEventListener('click', showAxisDropdownContent);
  DomEl.img.tempSettings.removeEventListener('click', showTempDropdownContent);
  DomEl.img.uploadSetting.removeEventListener('click', uploadSettingsToSensor);
  DomEl.img.dfu.removeEventListener('click', switchToDFUMode);
}

function draw() {
  if (IsConnected) {
    DomEl.img.BLEsymbol.src = 'images/logoSB.svg';
    DomEl.img.connectionButton.src = 'images/BLE_disconnect.svg';
    DomEl.img.log.src = 'images/Log.svg';
    DomEl.span.connection.textContent = 'Disconnect from Sensor';
    activateSettings();
    DomEl.img.log.addEventListener('click', loggingCallback);
    // Request a screen wake lock…
    requestWakeLock();
  } else {
    DomEl.img.BLEsymbol.src = "images/logoSB_dis.svg";
    DomEl.img.connectionButton.src = 'images/search.svg';
    DomEl.img.log.src = 'images/Log_gray.svg';
    DomEl.span.connection.textContent = 'Start scanning for Sensors';
    deactivateSettings();
    DomEl.img.log.removeEventListener('click', loggingCallback);
    // Release the screen wake lock…
    if (WakeLock !== null) {
      WakeLock.release();
      WakeLock = null;
    }
  }
}

function uploadSettingsToSensor() {
  let accelerometerDividerInputValue = Number(document.getElementById("inp_sli_accelerometerDivider").value);
  accelerometerDividerInputValue = Math.round(SensorBaseFrequency / (GlobalFrequencyDivider * accelerometerDividerInputValue));
  updateChar16Bit(Characteristics.acc.divider, accelerometerDividerInputValue);

  let slider = document.getElementById("inp_sli_temperatureDivider");
  let temperatureDividerInputValue = mapLinearToLog(slider.value, slider.min, slider.max, TemperatureFreqSlideMin, TemperatureFreqSlideMax);
  temperatureDividerInputValue = Math.round(SensorBaseFrequency / (GlobalFrequencyDivider * temperatureDividerInputValue));
  setTimeout(() => {
    updateChar16Bit(Characteristics.temp.divider, temperatureDividerInputValue);
  }, 1000);

  // let voltageDividerInputValue = Number(document.getElementById('inp_num_voltageDivider').value);
  // voltageDividerInputValue = Math.round(SensorBaseFrequency / (GlobalFrequencyDivider * voltageDividerInputValue));
  // setTimeout(() => {
  //   updateChar16Bit(voltageDividerCharacteristic, voltageDividerInputValue);
  // }, 2000);
}

function switchToDFUMode() {
  console.log('dfuCharacteristic =' + Characteristics.dfu.dfu);
  Characteristics.dfu.dfu.writeValue(DfuCommand);
}

function connectingToBLEDevice(device) { // have to be a promise
  console.log("Connecting to GATT Server...");
  DomEl.p.statusText.innerHTML = `Connecting to GATT Server`;
  BluetoothDevice = device;
  BluetoothDevice.addEventListener("gattserverdisconnected", onDisconnected);
  return device.gatt.connect();
}

function readBLEServices(server) {
  console.log("Getting Services...");
  DomEl.p.statusText.innerHTML = `Getting Services`;
  return server.getPrimaryServices();
}

function readBLECharacteristics(services) {
  console.log("Getting Characteristics...");
  DomEl.p.statusText.innerHTML = `Getting Characteristics`;
  let queue = Promise.resolve();
  console.log("services: ", services);
  services.forEach((service) => {
    queue = queue.then((_) =>
      service.getCharacteristics().then((characteristics) => {
        if (service.uuid === UUIDs.acc.service) {
          characteristics.forEach((characteristic) => {
            if (characteristic.uuid === UUIDs.acc.characteristics.filter) {
              Characteristics.acc.filter = characteristic;
              Characteristics.acc.filter.addEventListener(
                "characteristicvaluechanged",
                handleAccelerometerFilterCharacteristicChanged
              );
              setTimeout(() => {
                Characteristics.acc.filter.readValue().catch((error) => {
                  console.warn("Fail: " + error);
                  console.warn(
                    `Fail while characteristics.acc.filter.readValue()`
                  );
                  DomEl.p.statusText.innerHTML = `Connection failed`;
                  disconnetDiviceClean();
                  return;
                });
              }, 200);
            } else if (
              characteristic.uuid === UUIDs.acc.characteristics.lpFilter
            ) {
              Characteristics.acc.lpFilter = characteristic;
              Characteristics.acc.lpFilter.addEventListener(
                "characteristicvaluechanged",
                handleAccelerometerLpFilterCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.acc.characteristics.range
            ) {
              Characteristics.acc.range = characteristic;
              Characteristics.acc.range.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerRangeCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.acc.characteristics.divider
            ) {
              Characteristics.acc.divider = characteristic;
              Characteristics.acc.divider.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerDividerCharacteristicChanged
              );
            } else if (characteristic.uuid === UUIDs.acc.characteristics.axis) {
              Characteristics.acc.axis = characteristic;
              Characteristics.acc.axis.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerAxisCharacteristicChanged
              );
            } else if (characteristic.uuid === UUIDs.acc.characteristics.data) {
              Characteristics.acc.data = characteristic;
              Characteristics.acc.data.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerDataCharacteristicChanged
              );
              if (document.getElementById("inp_check_accelerometer").checked) {
                Characteristics.acc.data.startNotifications().catch((error) => {
                  console.warn("Fail: " + error);
                  console.warn(
                    `Fail while accelerometerDataCharacteristic.startNotifications()`
                  );
                  DomEl.p.statusText.innerHTML = `Connection failed`;
                  disconnetDiviceClean();
                  return;
                });
              }
            } else if (characteristic.uuid === UUIDs.acc.characteristics.type) {
              Characteristics.acc.type = characteristic;
              Characteristics.acc.type.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerTypeCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.acc.characteristics.resolution
            ) {
              Characteristics.acc.resolution = characteristic;
              Characteristics.acc.resolution.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerResolutionCharacteristicChanged
              );
            } else if (characteristic.uuid === UUIDs.acc.characteristics.bin) {
              Characteristics.acc.bin = characteristic;
              Characteristics.acc.bin.addEventListener(
                "characteristicvaluechanged",
                handleaccelerometerBinCharacteristicChanged
              );
            }
          });
        } else if (service.uuid === UUIDs.temp.service) {
          characteristics.forEach((characteristic) => {
            if (characteristic.uuid === UUIDs.temp.characteristics.divider) {
              Characteristics.temp.divider = characteristic;
              Characteristics.temp.divider.addEventListener(
                "characteristicvaluechanged",
                handletemperatureDividerCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.temp.characteristics.data
            ) {
              Characteristics.temp.data = characteristic;
              Characteristics.temp.data.addEventListener(
                "characteristicvaluechanged",
                handletemperatureDataCharacteristicChanged
              );
            }
          });
        } else if (service.uuid === UUIDs.volt.service) {
          characteristics.forEach((characteristic) => {
            if (characteristic.uuid === UUIDs.volt.characteristics.divider) {
              Characteristics.voltage.divider = characteristic;
              Characteristics.voltage.divider.addEventListener(
                "characteristicvaluechanged",
                handlevoltageDividerCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.volt.characteristics.data
            ) {
              Characteristics.voltage.data = characteristic;
              Characteristics.voltage.data.addEventListener(
                "characteristicvaluechanged",
                handlevoltageDataCharacteristicChanged
              );
            }
          });
        } else if (service.uuid === UUIDs.info.service) {
          characteristics.forEach((characteristic) => {
            if (
              characteristic.uuid === UUIDs.info.characteristics.hardwareVersion
            ) {
              Characteristics.info.hardwareVersion = characteristic;
              Characteristics.info.hardwareVersion.addEventListener(
                "characteristicvaluechanged",
                handleinfoHardwareVersionCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.info.characteristics.softwareVersion
            ) {
              Characteristics.info.softwareVersion = characteristic;
              Characteristics.info.softwareVersion.addEventListener(
                "characteristicvaluechanged",
                handleinfoSoftwareVersionCharacteristicChanged
              );
            } else if (
              characteristic.uuid === UUIDs.info.characteristics.globalDivider
            ) {
              Characteristics.info.globalDivider = characteristic;
              Characteristics.info.globalDivider.addEventListener(
                "characteristicvaluechanged",
                handleinfoGlobalDividerCharacteristicChanged
              );
            }
          });
        } else if (service.uuid === UUIDs.dfu.service) {
          characteristics.forEach((characteristic) => {
            if (characteristic.uuid === UUIDs.dfu.characteristics.dfu) {
              Characteristics.dfu.dfu = characteristic;
              Characteristics.dfu.dfu.addEventListener(
                "characteristicvaluechanged",
                handledfuCharacteristicChanged
              );
              // dfuCharacteristic.startNotifications()
              //   .catch(error => {
              //     console.warn('Fail: ' + error);
              //     console.warn(`Fail while dfuCharacteristic.startNotifications()`);
              //     statusText_p.innerHTML = `Connection failed`;
              //     bluetoothDevice.gatt.disconnect();
              //     return;
              //   });
            }
          });
        }
        IsConnected = true;
        draw();
        DomEl.p.statusText.innerHTML = `Connection complete`;
      })
    );
  });
  return queue;
}

function onButtonClick() {
  BluetoothDevice = null;
  ShouldDisconnect = false;

  let options = {
    filters: [
      // { services: [UUIDs.acc.service] },
      // { services: [UUIDs.temp.service] },
      // { name: 'Smart B' }, // only devices with ''
      // { namePrefix: "Smart" }, // only devices starts with ''
      {
        manufacturerData: [
          {
            companyIdentifier: 0x59,
            dataPrefix: new Uint8Array([
              0x44, 0x6f, 0x6d, 0x69, 0x6e, 0x69, 0x6b, 0x20, 0x47, 0x2e]),
          },
        ],
      },
    ],
    optionalServices: [
      UUIDs.acc.service,
      UUIDs.temp.service,
      UUIDs.volt.service,
      UUIDs.info.service,
      UUIDs.dfu.service,
    ],
    // acceptAllDevices : true  // show all
  };

  console.log('Requesting Bluetooth Device...');
  DomEl.p.statusText.innerHTML = `Scanning for Bluetooth Device`;
  navigator.bluetooth.requestDevice(options)
    .then(device => {
      return connectingToBLEDevice(device);
    })
    .then(server => {
      return readBLEServices(server);
    })
    .then(services => {
      return readBLECharacteristics(services);
    })
    .catch(error => {
      console.warn('Fail: ' + error);
      DomEl.p.statusText.innerHTML = "Connection failed";
      draw();
    });
}

function reconnect(device) {
  connectingToBLEDevice(device)
    .then((server) => {
      return readBLEServices(server);
    })
    .then((services) => {
      return readBLECharacteristics(services);
    })
    .catch((error) => {
      console.warn("Fail: " + error);
      DomEl.p.statusText.innerHTML = "Reconnection failed";
      draw();
    });
}

function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

function disconnetDiviceClean() {
  if (BluetoothDevice.gatt.connected) {
    ShouldDisconnect = true;
    BluetoothDevice.gatt.disconnect();
  } else {
    console.log("Bluetooth Device is already disconnected");
  }
}

function onDisconnectButtonClick() {
  if (!BluetoothDevice) {
    return;
  }
  console.log('Disconnecting from Bluetooth Device...');
  disconnetDiviceClean();
}

function onDisconnected(event) {
  console.log('Bluetooth Device disconnected');
  DomEl.p.statusText.innerHTML = `Disconnected`;
  IsConnected = false;
  logging(true);
  draw();
  if (!ShouldDisconnect && BluetoothDevice) 
  {
    console.log("try to reconnect");
    reconnect(BluetoothDevice);
  }
}

function convert12to16int(value)
{
  if (value & (1 << 11)) 
    value = value | (-1 << 12);
  else
    value = value & 0xFFF;

  return value;
}

function handleaccelerometerDataCharacteristicChanged(event) {
  let dataValueLength = event.target.value.byteLength;

  if (event.target.value.getUint8(0) >= 1) {
    if (AccChart.data.datasets.length === 3) {
      AccChart.options.legend.display = true;
      AccChart.data.datasets.splice(1, 2);
    }

    if (AccChart.data.datasets[0].label !== DDContent.PossibleAxis[event.target.value.getUint8(0)]) { AccChart.data.datasets[0].label = DDContent.PossibleAxis[event.target.value.getUint8(0)]; }

    let logdataAccTemp = '';
    for (let i = 1; i < dataValueLength - 4; i += 2) {
      let value = event.target.value.getInt16(i);
      let magValue
      if (SoftwareVersion >= 3) {
        magValue = (value >> 14) & 0x3;
        DomEl.p.statusMag.innerHTML=magValue;
        value = convert12to16int(value);
      }
      AccData[AccDataPointer] = value / AccVauleDivider;
      if (LoggingActive) {
        try {
          if (i < (dataValueLength - 6)) {
            logdataAccTemp += (value + `;` + magValue + `;` + `\n`);
          } else {
            logdataAccTemp += (value + `;` + magValue + `;`);
          }
        } catch (error) {
          console.warn('Fail: ' + error);
          DomEl.p.statusText.innerHTML = error;
        }
      }
      if (AccDataPointer < FftLength - 1)
        AccDataPointer++;
      else
        AccDataPointer = 0;
    }
    if (LoggingActive) {
      try {
        logdataAccTemp += (event.target.value.getInt32(dataValueLength - 4));
        window.api.send("writeToAccDocument", logdataAccTemp+"\n");
      } catch (error) {
        console.warn('Fail: ' + error);
        DomEl.p.statusText.innerHTML = error;
      }
    }

    if (AccUpdateDividerValue >= AccUpdateDivider) {
      AccUpdateDividerValue = 0;
      let fftdata = [...AccData];
      fftTotalResult = getTotalFFT(fftdata).slice(0, FftLength / 2);

      let indexOfMax = fftTotalResult.slice(1).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) + 1;
      newPeakFreq = Object.values(AccChartData)[indexOfMax].x

      if (PeakFreq != newPeakFreq)
      {
        PeakFreq = newPeakFreq;

        DomEl.p.toneFrequency.innerHTML = newPeakFreq.toFixed(1);
        DomEl.p.trumForce.innerHTML = (newPeakFreq**2 * 4 * Number(DomEl.input.beltWeight.value) * (Number(DomEl.input.trumLength.value)/1000)**2).toFixed(1);
      }

      AccChart.data.datasets[0].data = AccChart.data.datasets[0].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResult[index]
          }
        }
      );
      AccChart.update();
    }
    else
      AccUpdateDividerValue++;
  } else if (event.target.value.getUint8(0) == 0) {
    if (AccChart.data.datasets.length === 1) {
      AccChart.data.datasets[0].label = 'x Axis';
      AccChart.options.legend.display = true;
      let newDataset = {
        label: 'y Axis',
        data: AccChartData,
        backgroundColor: 'rgb(68, 192, 37)',
        borderColor: 'rgb(68, 192, 37)',
        fill: false,
        pointHoverBackgroundColor: 'rgb(218, 15, 15)',
        borderWidth: 3
      };
      let newDataset2 = {
        label: 'z Axis',
        data: AccChartData,
        backgroundColor: 'rgb(22, 11, 179)',
        borderColor: 'rgb(22, 11, 179)',
        fill: false,
        pointHoverBackgroundColor: 'rgb(218, 15, 15)',
        borderWidth: 3
      };
      AccChart.data.datasets.push(newDataset);
      AccChart.data.datasets.push(newDataset2);
    }

    let logdataAccTemp = '';
    for (let i = 1; i < dataValueLength - 4;) {
      let valueX = event.target.value.getInt16(i);
      i = i + 2;
      let valueY = event.target.value.getInt16(i);
      i = i + 2;
      let valueZ = event.target.value.getInt16(i);
      i = i + 2;

      AccDataX[AccDataPointer] = valueX / AccVauleDivider;
      AccDataY[AccDataPointer] = valueY / AccVauleDivider;
      AccDataZ[AccDataPointer] = valueZ / AccVauleDivider;
      if (LoggingActive) {
        try {
          if (i <= (dataValueLength - 4 - 2 * 3)) {
            logdataAccTemp += (valueX + `;` + valueY + `;` + valueZ + `;` + `\n`);
          } else {
            logdataAccTemp += (valueX + `;` + valueY + `;` + valueZ + `;`);
          }
        } catch (error) {
          console.warn('Fail: ' + error);
          DomEl.p.statusText.innerHTML = error;
        }
      }
      if (AccDataPointer < FftLength - 1)
        AccDataPointer++;
      else
        AccDataPointer = 0;
    }
    if (LoggingActive) {
      try {
        logdataAccTemp += (event.target.value.getInt32(dataValueLength - 4));
        window.api.send("writeToAccDocument", logdataAccTemp + "\n");
      } catch (error) {
        console.warn('Fail: ' + error);
        DomEl.p.statusText.innerHTML = error;
      }
    }

    if (AccUpdateDividerValue >= AccUpdateDivider * 3) {
      AccUpdateDividerValue = 0;
      let fftdataX = [...AccDataX];
      let fftdataY = [...AccDataY];
      let fftdataZ = [...AccDataZ];
      let fftTotalResultX = getTotalFFT(fftdataX).slice(0, FftLength / 2);
      let fftTotalResultY = getTotalFFT(fftdataY).slice(0, FftLength / 2);
      let fftTotalResultZ = getTotalFFT(fftdataZ).slice(0, FftLength / 2);

      AccChart.data.datasets[0].data = AccChart.data.datasets[0].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResultX[index]
          }
        }
      );
      AccChart.data.datasets[1].data = AccChart.data.datasets[1].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResultY[index]
          }
        }
      );
      AccChart.data.datasets[2].data = AccChart.data.datasets[2].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResultZ[index]
          }
        }
      );
      AccChart.update();
      if (LoggingActive) {
        if (performance.memory.jsHeapSizeLimit === performance.memory.usedJSHeapSize) {
          console.log(`Stop logging (memory problems)`);
          logging(true);
        }
      }
    }
    else
      AccUpdateDividerValue++;
  }
}

function handletemperatureDataCharacteristicChanged(event) {
  let dataValueLength = event.target.value.byteLength;
  for (let i = 0; i < dataValueLength - 4; i += 2) {
    TempTime = TempTime + (1 / Temperature_time_divider);
    let value = event.target.value.getInt16(i) / TEMPERATURE_DIVIDER;
    if (value < TempYMin)
      TempYMin = value;

    if (value > TempYMax)
      TempYMax = value;

    TempChart.data.datasets[0].data.push({ x: TempTime, y: value });

    if (LoggingActive) {
      if (i < (dataValueLength - 6)) {
        window.api.send("writeToTempDocument", value + `;` + `\n`);
      } else {
        window.api.send("writeToTempDocument", value + `;`);
      }
    }
  }
  if (LoggingActive) {
    window.api.send(
      "writeToTempDocument",
      event.target.value.getInt32(dataValueLength - 4) + "\n"
    );
  }

  TempChart.resetZoom();
  TempChart.config.options.scales.yAxes[0].ticks.min = Math.round(TempYMin - TempAxisAhead);
  TempChart.config.options.scales.yAxes[0].ticks.max = Math.round(TempYMax + TempAxisAhead);
  if (TempTime - TEMP_TIME_WINDOW > 0) {
    TempChart.config.options.scales.xAxes[0].ticks.min = Math.round((TempTime - TEMP_TIME_WINDOW) * 10) / 10;
    TempChart.config.options.scales.xAxes[0].ticks.max = Math.round(TempTime * 10) / 10;
  }

  TempChart.update();
}

function handleAccelerometerFilterCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer high pass filter = ' + DDContent.ADXL372accFilters[Characteristics.acc.filter.value.getUint8(0)] + ' Hz');
  if (InitialCharacteristicRead){
    // accelerometerLpFilterCharacteristic.readValue()
    Characteristics.acc.lpFilter.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while Characteristics.acc.lpFilter.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleAccelerometerLpFilterCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer low pass filter = ' + DDContent.ADXL372accLpFilters[Characteristics.acc.lpFilter.value.getUint8(0)] + ' Hz');
  if (InitialCharacteristicRead) {
    Characteristics.acc.range.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while Characteristics.acc.range.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleaccelerometerRangeCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer range = ' + DDContent.ADXL372Range[Characteristics.acc.range.value.getUint8(0)]);
  if (InitialCharacteristicRead) {
    Characteristics.acc.divider.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while accelerometerDividerCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleaccelerometerDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  if (InitialCharacteristicRead) {
    Characteristics.acc.axis.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while accelerometerAxisCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
  else{
    if (typeof Characteristics.acc.lpFilter !== "undefined" &&
      Characteristics.acc.lpFilter.value !== null) {
      Characteristics.acc.lpFilter.readValue()
        .catch(error => {
          console.warn('Fail: ' + error);
          console.warn(`Fail while Characteristics.acc.lpFilter.readValue()`);
          DomEl.p.statusText.innerHTML = `Connection failed`;
          disconnetDiviceClean();
          return;
        });
    }
  }
}

function handleaccelerometerAxisCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer transmitting Axis = ' + DDContent.PossibleAxis[Characteristics.acc.axis.value.getUint8(0)]);
  if (InitialCharacteristicRead) {
    Characteristics.acc.type.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while accelerometerTypeCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleaccelerometerTypeCharacteristicChanged(event) {
  console.log('Accelerometer Type = ' + UsedAccelerometer[Characteristics.acc.type.value.getUint8(0)]);
  if (InitialCharacteristicRead) {
    Characteristics.acc.resolution.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while accelerometerResolutionCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleaccelerometerResolutionCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer Resolution = ' + Characteristics.acc.resolution.value.getUint8(0) + ' Bit');
  if (InitialCharacteristicRead) {
    Characteristics.acc.bin.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while accelerometerBinCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleaccelerometerBinCharacteristicChanged(event) {
  console.log('Accelerometer bin size = ' + Characteristics.acc.bin.value.getUint8(0) + ' values');
  if (InitialCharacteristicRead) {
    Characteristics.temp.divider.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while temperatureDividerCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handletemperatureDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  if (InitialCharacteristicRead) {
    Characteristics.voltage.divider.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while voltageDividerCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handlevoltageDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  if (InitialCharacteristicRead) {
    Characteristics.info.hardwareVersion.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while infoHardwareVersionCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handlevoltageDataCharacteristicChanged(event) {
  // TODO 
}

function handleinfoHardwareVersionCharacteristicChanged(event) {
  HardwareVersion = Characteristics.info.hardwareVersion.value.getUint8(0);
  console.log('Hardware Version = ' + HardwareVersion);
  if (InitialCharacteristicRead) {
    Characteristics.info.softwareVersion.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while infoSoftwareVersionCharacteristic.readValue()`);
        statusTexwarnt_p.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleinfoSoftwareVersionCharacteristicChanged(event) {
  SoftwareVersion = Characteristics.info.softwareVersion.value.getUint8(0);
  console.log('Software Version = ' + SoftwareVersion);
  if (InitialCharacteristicRead) {
    Characteristics.info.globalDivider.readValue()
      .catch(error => {
        console.warn('Fail: ' + error);
        console.warn(`Fail while infoGlobalDividerCharacteristic.readValue()`);
        DomEl.p.statusText.innerHTML = `Connection failed`;
        disconnetDiviceClean();
        return;
      });
  }
}

function handleinfoGlobalDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Global frequency divider = ' + GlobalFrequencyDivider);
  if (InitialCharacteristicRead) {
    if (document.getElementById("inp_check_temperature").checked) {
      Characteristics.temp.data.startNotifications()
        .catch(error => {
          console.warn('Fail: ' + error);
          console.warn(`Fail while temperatureDataCharacteristic.startNotifications()`);
          DomEl.p.statusText.innerHTML = `Connection failed`;
          disconnetDiviceClean();
          return;
        });
    }
    setTimeout(() => {
      Characteristics.dfu.dfu.startNotifications()
        .catch(error => {
          console.warn('Fail: ' + error);
          console.warn(`Fail while dfuCharacteristic.startNotifications()`);
          DomEl.p.statusText.innerHTML = `Connection failed`;
          disconnetDiviceClean();
          return;
        });
    }, 1000);
    
    // setTimeout(() => {
    //   if (document.getElementById("inp_check_voltage").checked) {
    //     voltageDataCharacteristic.startNotifications()
    //       .catch(error => {
    //         console.warn('Fail: ' + error);
    //         console.warn(`Fail while voltageDataCharacteristic.startNotifications()`);
    //         statusText_p.innerHTML = `Connection failed`;
    //         bluetoothDevice.gatt.disconnect();
    //         return;
    //       });
    //   }
    // }, 2000);
  }

  InitialCharacteristicRead = false;
}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function handledfuCharacteristicChanged(event) {
  let response = (Characteristics.dfu.dfu.value.getUint8(0) << 16) |
    (Characteristics.dfu.dfu.value.getUint8(1) << 8) |
    Characteristics.dfu.dfu.value.getUint8(2);
  console.log('dfu response = 0x' + response.toString(16));
  switch (Characteristics.dfu.dfu.value.getUint8(2)) {
    case 0:
      console.log('Invalid code	The provided opcode was missing or malformed.');
      break;
    case 1:
      console.log('Success	The operation completed successfully.');
      break;
    case 2:
      console.log('Opcode not supported	The provided opcode was invalid.');
      break;
    case 4:
      console.log('Operation failed	The operation failed.');
      break;
    case 5:
      console.log('Invalid advertisement name	The requested advertisement name was invalid(empty or too long).Only available without bond support.');
      break;
    case 6:
      console.log('Busy	The request was rejected due to a ongoing asynchronous operation.');
      break;
    case 7:
      console.log('Not bonded	The request was rejected because no bond was created.');
      break;
    default:
      console.log('Unknown error');
      break;
  }
}

function handleSetupCharacteristicChanged() {
  let valueString = ' ';

  if (
    typeof Characteristics.info.globalDivider !== "undefined" &&
    typeof Characteristics.acc.resolution !== "undefined" &&
    typeof Characteristics.acc.range !== "undefined" &&
    typeof Characteristics.temp.divider !== "undefined" &&
    typeof Characteristics.acc.filter !== "undefined" &&
    typeof Characteristics.acc.lpFilter !== "undefined" &&
    typeof Characteristics.acc.axis !== "undefined" &&
    typeof Characteristics.acc.divider !== "undefined"
  ) {
    if (
      Characteristics.info.globalDivider.value !== null &&
      Characteristics.acc.resolution.value !== null &&
      Characteristics.acc.range.value !== null &&
      Characteristics.temp.divider.value !== null &&
      Characteristics.acc.filter.value !== null &&
      Characteristics.acc.lpFilter.value !== null &&
      Characteristics.acc.axis.value !== null &&
      Characteristics.acc.divider.value !== null
    ) {
      GlobalFrequencyDivider =
        Characteristics.info.globalDivider.value.getUint8(0);
      AccVauleDivider =
        Math.pow(
          2,
          Characteristics.acc.resolution.value.getUint8(0) - 1
        ) / DDContent.AccRanges[Characteristics.acc.range.value.getUint8(0)];

      SmapleFrequencyTemp =
        SensorBaseFrequency /
        Characteristics.temp.divider.value.getUint16(0, true) /
        GlobalFrequencyDivider;

      document.getElementById("inp_num_accelerometerDivider").innerHTML =
        SensorBaseFrequency /
          (Characteristics.acc.divider.value.getUint16(0, true) *
            GlobalFrequencyDivider) +
        " Hz";
      document.getElementById("inp_sli_accelerometerDivider").value =
        SensorBaseFrequency /
        (Characteristics.acc.divider.value.getUint16(0, true) *
          GlobalFrequencyDivider);
      console.log(
        "Accelerometer frequency divider = " +
          Characteristics.acc.divider.value.getUint16(0, true)
      );
      console.log(
        "--> frequency = " +
          SensorBaseFrequency /
            Characteristics.acc.divider.value.getUint16(0, true) /
            GlobalFrequencyDivider +
          " Hz"
      );

      document.getElementById("inp_num_temperatureDivider").innerHTML =
        Math.round(
          (SensorBaseFrequency /
            Characteristics.temp.divider.value.getUint16(0, true) /
            GlobalFrequencyDivider) *
            1000
        ) /
          1000 +
        " Hz";
      let slider = document.getElementById("inp_sli_temperatureDivider");
      slider.value = mapLogToLinear(
        SensorBaseFrequency /
          (Characteristics.temp.divider.value.getUint16(0, true) *
            GlobalFrequencyDivider),
        slider.min,
        slider.max,
        TemperatureFreqSlideMin,
        TemperatureFreqSlideMax
      );
      console.log(
        "Temperature frequency divider = " +
          Characteristics.temp.divider.value.getUint16(0, true)
      );
      console.log(
        "--> frequency = " +
          SensorBaseFrequency /
            Characteristics.temp.divider.value.getUint16(0, true) /
            GlobalFrequencyDivider +
          " Hz"
      );

      // document.getElementById("inp_num_voltageDivider").value = SensorBaseFrequency / (voltageDividerCharacteristic.value.getUint16(0, true) * GlobalFrequencyDivider);
      voltageFreqNumber();
      console.log(
        "Voltage frequency divider = " +
          Characteristics.voltage.divider.value.getUint16(0, true)
      );
      console.log(
        "--> frequency = " +
          SensorBaseFrequency /
            Characteristics.voltage.divider.value.getUint16(0, true) /
            GlobalFrequencyDivider +
          " Hz"
      );

      valueString +=
        "HP Filter: " +
        DDContent.ADXL372accFilters[Characteristics.acc.filter.value.getUint8(0)] +
        "Hz,";
      valueString +=
        "LP Filter: " +
        DDContent.ADXL372accLpFilters[
          Characteristics.acc.lpFilter.value.getUint8(0)
        ] +
        "Hz,";
      valueString +=
        " Range: +-" +
        DDContent.AccRanges[Characteristics.acc.range.value.getUint8(0)] +
        "g,";
      valueString +=
        " Axis: " +
        DDContent.PossibleAxis[Characteristics.acc.axis.value.getUint8(0)];
      valueString +=
        " Temperature: " + Number(SmapleFrequencyTemp).toFixed(2) + `Hz`;

      Temperature_time_divider = 60 * SmapleFrequencyTemp;

      document.getElementById("setupInfoText").innerHTML = valueString;

      SmapleFrequencyAcc =
        SensorBaseFrequency /
        GlobalFrequencyDivider /
        Characteristics.acc.divider.value.getUint8(0);
      DisplayFrequencyrange = SmapleFrequencyAcc / 2;

      AccChart.data.datasets[0].data = AccChart.data.datasets[0].data.map(
        (entry, index) => {
          return {
            x: index * (DisplayFrequencyrange / (FftLength / 2 - 1)),
            y: entry.y,
          };
        }
      );
    }
  }
}

function getTotalFFT(data) {
  let size = data.length;
  let fft = new FFTNayuki(size);

  let total = 0.0;
  let result = [];

  let real = data;
  let imag = zeroReals(size);

  fft.forward(real, imag);

  for (let j = 0; j < size / 2; ++j) {
    total = (Math.sqrt(real[j] * real[j] + imag[j] * imag[j])) / size;
    result.push(total);
  }
  return result;
}

function zeroReals(size) {
  let result = new Float32Array(size);
  for (let i = 0; i < result.length; i++)
    result[i] = 0.0;
  return result;
}

function mapLinearToLog(value, minLin, maxLin, minLog, maxLog) {
  value = Number(value);
  minLin = Number(minLin);
  maxLin = Number(maxLin);
  minLog = Number(minLog);
  maxLog = Number(maxLog);
  return minLog * (maxLog / minLog) ** ((minLin - value) / (minLin - maxLin));
}

function mapLogToLinear(value, minLin, maxLin, minLog, maxLog) {
  value = Number(value);
  minLin = Number(minLin);
  maxLin = Number(maxLin);
  minLog = Number(minLog);
  maxLog = Number(maxLog);
  return minLin + ((minLin - maxLin) * (Math.log(minLog / value))) / Math.log(maxLog / minLog);
}

function accelerometerFreqSlide() {
  document.getElementById("inp_num_accelerometerDivider").innerHTML = document.getElementById("inp_sli_accelerometerDivider").value + ' Hz';
}

function temperatureFreqSlide() {
  let slider = document.getElementById("inp_sli_temperatureDivider");
  let inputNumTempFreq = document.getElementById("inp_num_temperatureDivider");
  inputNumTempFreq.innerHTML = Math.round(mapLinearToLog(slider.value, slider.min, slider.max, TemperatureFreqSlideMin, TemperatureFreqSlideMax) * 100) / 100 + ' Hz';
}

function voltageFreqSlide() {
  document.getElementById("inp_num_voltageDivider").value = document.getElementById("inp_sli_voltageDivider").value;
}

function accelerometerFreqNumber() {
  document.getElementById("inp_sli_accelerometerDivider").value = document.getElementById("inp_num_accelerometerDivider").value;
}

function temperatureFreqNumber() {
  let slider = document.getElementById("inp_sli_temperatureDivider");
  let inputNumTempFreq = document.getElementById("inp_num_temperatureDivider");
  slider.value = mapLogToLinear(inputNumTempFreq.value, slider.min, slider.max, TemperatureFreqSlideMin, TemperatureFreqSlideMax);
}

function voltageFreqNumber() {
  // document.getElementById("inp_sli_voltageDivider").value = document.getElementById("inp_num_voltageDivider").value;
}

function ValidateAccelerometerSelection() {
  if (typeof Characteristics.acc.data !== "undefined") {
    if (document.getElementById("inp_check_accelerometer").checked) {
      Characteristics.acc.data.startNotifications()
        .catch(error => {
          console.log('Error: accelerometerDataCharacteristic.startNotifications()');
          return;
        });
    } else {
      Characteristics.acc.data.stopNotifications()
        .catch(error => {
          console.log('Error: accelerometerDataCharacteristic.stopNotifications()');
          return;
        });
    }
  }
}

function ValidateTemperatureSelection() {
  if (typeof Characteristics.temp.data !== "undefined") {
    if (document.getElementById("inp_check_temperature").checked) {
      Characteristics.temp.data.startNotifications()
        .catch(error => {
          console.log('Error: temperatureDataCharacteristic.startNotifications()');
          return;
        });
    } else {
      Characteristics.temp.data.stopNotifications()
        .catch(error => {
          console.log('Error: temperatureDataCharacteristic.startNotifications()');
          return;
        });
    }
  }
}

function ValidateVoltageSelection() {
  if (typeof Characteristics.voltage.data !== "undefined") {
    if (document.getElementById("inp_check_temperature").checked) {
      Characteristics.voltage.data.startNotifications()
        .catch(error => {
          console.log('Error: voltageDataCharacteristic.startNotifications()');
          return;
        });
    } else {
      Characteristics.voltage.data.stopNotifications()
        .catch(error => {
          console.log('Error: voltageDataCharacteristic.startNotifications()');
          return;
        });
    }
  }
}

function initAccChart() {
  let xAxesTicksMax = DDContent.PossibleAxisLimits[2];
  let xAxesTicksStepSize = DDContent.PossibleAxisLimits[2] / 20;
  let xLimitStored = localStorage.getItem('xLimit')
  if (null !== xLimitStored) {
    xAxesTicksMax = DDContent.PossibleAxisLimits[xLimitStored];
    xAxesTicksStepSize = DDContent.PossibleAxisLimits[xLimitStored] / 20;
  }

  AccChart = new Chart(document.getElementById('accChart').getContext('2d'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'accData',
        data: AccChartData,
        backgroundColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(255, 255, 255)',
        fill: false,
        pointHoverBackgroundColor: 'rgb(218, 15, 15)',
        borderWidth: 3
      }]
    },
    options: {
      elements: {
        line: {
          tension: 0.2 // disables bezier curves
        },
        point: {
          radius: 1,
          hitRadius: 5
        }
      },
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Acceleration',
        fontSize: TitleFontSize,
        fontColor: ChartFontColor,
      },
      legend: {
        display: false,
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0, // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize  
      scales: {
        xAxes: [{
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'Frequency in Hz',
            fontSize: AxisFontSize,
            fontColor: ChartFontColor,
          },
          ticks: {
            fontSize: AxisTickFontSize,
            beginAtZero: true,
            stepSize: xAxesTicksStepSize,
            max: xAxesTicksMax,
            fontColor: ChartFontColor,
          }
        }],
        yAxes: [{
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'Normalized amplitude',
            fontSize: AxisFontSize,
            fontColor: ChartFontColor,
          },
          ticks: {
            fontSize: AxisTickFontSize,
            beginAtZero: true,
            fontColor: ChartFontColor,
          },
        }],
      },
      plugins: {
        zoom: {
          // Container for pan options
          pan: {
            // Boolean to enable panning
            enabled: true,
            rangeMin: {
              // Format of min pan range depends on scale type
              x: 0,
              y: 0
            },
            rangeMax: {
              // Format of max pan range depends on scale type
              x: null,
              y: null
            },
          },
          // Container for zoom options
          zoom: {
            // Boolean to enable zooming
            enabled: false,
            // drag-to-zoom behavior
            drag: false,
            mode: 'xy',
            rangeMin: {
              // Format of min zoom range depends on scale type
              x: 0,
              y: 0
            },
            rangeMax: {
              // Format of max zoom range depends on scale type
              x: null,
              y: null
            },
            // Speed of zoom via mouse wheel
            // (percentage of zoom on a wheel event)
            speed: 0.03,
          }
        }
      }
    }
  });
}

function initTempChart() {
  TempChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'Temperature Data',
        data: [],
        backgroundColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(255, 255, 255)',
        fill: false,
        pointHoverBackgroundColor: 'rgb(218, 15, 15)',
        borderWidth: 3,
      }]
    },
    options: {
      elements: {
        line: {
          tension: 0.2 // disables bezier curves
        },
        point: {
          radius: 1,
          hitRadius: 5
        }
      },
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Temperature',
        fontSize: TitleFontSize,
        fontColor: ChartFontColor,
      },
      legend: {
        display: false,
        labels: {
          fontColor: ChartFontColor,
          // fontSize: 18
        }
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0, // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize  
      scales: {
        xAxes: [{
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'time in m',
            fontSize: AxisFontSize,
            fontColor: ChartFontColor,
          },
          ticks: {
            fontSize: AxisTickFontSize,
            // beginAtZero: true,
            stepSize: 0.1,
            min: 0,
            max: TEMP_TIME_WINDOW,
            maxTicksLimit: 11,
            fontColor: ChartFontColor,
          }
        }],
        yAxes: [{
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'Temperature in °C',
            fontSize: AxisFontSize,
            fontColor: ChartFontColor,
          },
          ticks: {
            fontSize: AxisTickFontSize,
            min: 20,
            max: 30,
            fontColor: ChartFontColor,
          }
        }],
      },
      plugins: {
        zoom: {
          // Container for pan options
          pan: {
            // Boolean to enable panning
            enabled: true,
            mode: 'x',
            rangeMin: {
              // Format of min pan range depends on scale type
              x: 0,
              y: null
            },
            rangeMax: {
              // Format of max pan range depends on scale type
              x: null,
              y: null
            },
          },
          // Container for zoom options
          zoom: {
            // Boolean to enable zooming
            enabled: true,
            // drag-to-zoom behavior
            drag: false,
            mode: 'x',
            rangeMin: {
              // Format of min zoom range depends on scale type
              x: 0,
              y: null
            },
            rangeMax: {
              // Format of max zoom range depends on scale type
              x: null,
              y: null
            },
            // Speed of zoom via mouse wheel
            // (percentage of zoom on a wheel event)
            speed: 0.1,
          }
        }
      }
    }
  });
}

window.onload = function() {
  setup();
}



// Menu
let menu = document.getElementById("img_menu");
let settingsGroupMedium = document.getElementById("settings-group-medium");
let settingsGroupLarge = document.getElementById("settings-group-large");
let settingsGroupVeryLarge1 = document.getElementById(
  "settings-group-very-large1"
);
let settingsGroupVeryLarge2 = document.getElementById(
  "settings-group-very-large2"
);
let hideableSettings = document.getElementById("hideable-settings");
let exit = document.getElementById("exit");

menu.addEventListener("click", function (e) {
  hideableSettings.classList.remove("hideable-settings-show");
  hideableSettings.classList.add("hideable-settings-hide");
  settingsGroupMedium.classList.toggle("hide-small");
  settingsGroupLarge.classList.toggle("hide-small");
  settingsGroupVeryLarge1.classList.toggle("hide-small");
  settingsGroupVeryLarge2.classList.toggle("hide-small");
  exit.style.display = "inherit";
  e.preventDefault();
});

exit.addEventListener("click", function (e) {
  hideableSettings.classList.add("hideable-settings-show");
  hideableSettings.classList.remove("hideable-settings-hide");
  settingsGroupMedium.classList.add("hide-small");
  settingsGroupLarge.classList.add("hide-small");
  settingsGroupVeryLarge1.classList.add("hide-small");
  settingsGroupVeryLarge2.classList.add("hide-small");
  exit.style.display = "none";
  e.preventDefault();
});

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);
window.addEventListener("resize", () => {
  vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});