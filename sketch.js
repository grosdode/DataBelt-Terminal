const accelerometerServiceUuid = "0000f00d-ef44-7fa8-4544-d09e246bac55"; // ACCELEROMETER_SERVICE_UUID
const accelerometerFilterCharacteristicUuid = "0000abcd-ef44-7fa8-4544-d09e246bac55";
const accelerometerLpFilterCharacteristicUuid = "0000ebcd-ef44-7fa8-4544-d09e246bac55";
const accelerometerRangeCharacteristicUuid = "0000bcde-ef44-7fa8-4544-d09e246bac55";
const accelerometerDividerCharacteristicUuid = "0000cdef-ef44-7fa8-4544-d09e246bac55";
const accelerometerAxisCharacteristicUuid = "0000bcda-ef44-7fa8-4544-d09e246bac55";
const accelerometerDataCharacteristicUuid = "0000cdeb-ef44-7fa8-4544-d09e246bac55";
const accelerometerTypeCharacteristicUuid = "0000defc-ef44-7fa8-4544-d09e246bac55";
const accelerometerResolutionCharacteristicUuid = "0000cdab-ef44-7fa8-4544-d09e246bac55";
const accelerometerBinCharacteristicUuid = "0000debc-ef44-7fa8-4544-d09e246bac55";

const temperatureServiceUuid = "0000f00d-f044-7fa8-4544-d09e246bac55"; // TEMPERATURE_SERVICE_UUID
const temperatureDividerCharacteristicUuid = "00000123-f044-7fa8-4544-d09e246bac55";
const temperatureDataCharacteristicUuid = "00001230-f044-7fa8-4544-d09e246bac55";

const voltageServiceUuid = "0000f00d-f144-7fa8-4544-d09e246bac55"; // VOLTAGE_SERVICE_UUID
const voltageDividerCharacteristicUuid = "00004567-f144-7fa8-4544-d09e246bac55";
const voltageDataCharacteristicUuid = "00005674-f144-7fa8-4544-d09e246bac55";

const infoServiceUuid = "0000f00d-f244-7fa8-4544-d09e246bac55"; // INFO_SERVICE_UUID
const infoHardwareVersionCharacteristicUuid = "00008901-f244-7fa8-4544-d09e246bac55";
const infoSoftwareVersionCharacteristicUuid = "00009018-f244-7fa8-4544-d09e246bac55";
const infoGlobalDividerCharacteristicUuid = "00000189-f244-7fa8-4544-d09e246bac55";

const dfuServiceUuid = "0000fe59-0000-1000-8000-00805f9b34fb"; // DFU_SERVICE_UUID
const dfuCharacteristicUuid = "8ec90003-f315-4f60-9fb8-838830daea50";

const ADXL372accFilters = [0, 3.96, 7.88, 15.58, 30.48];
const ADXL372accLpFilters = [200, 400, 800, 1600, 3200];
const H3LIS331DLacFilters = [0, 0.25, 2.5, 10, 20];
const AccRanges = [100, 200, 400];
const ADXL372Range = [' ', 200, ' '];
const PossibleAxis = ["All Axis", "X Axis", "Y Axis", "Z Axis"];
const PossibleAxisLimits = [50, 100, 200, 300, 500, 750, 1000, 1600];
const SensorBaseFrequency = 32768;
const usedAccelerometer = ["ADXL_372"];

const TempSampling = ["0.25", "0.5", "1", "2"];
const TEMP_TIME_WINDOW = 2;

const temperatureFreqSlideMin = 0.01;
const temperatureFreqSlideMax = 100;

let isConnected = false;
let bluetoothDevice;
let setupCharacteristic;
let dataCharacteristic;
let setupCharacteristicValue;

let accelerometerFilterCharacteristic;
let accelerometerLpFilterCharacteristic;
let accelerometerRangeCharacteristic;
let accelerometerDividerCharacteristic;
let accelerometerAxisCharacteristic;
let accelerometerDataCharacteristic;
let accelerometerTypeCharacteristic;
let accelerometerResolutionCharacteristic;
let accelerometerBinCharacteristic;

let temperatureDividerCharacteristic;
let temperatureDataCharacteristic;

let voltageDividerCharacteristic;
let voltageDataCharacteristic;

let infoHardwareVersionCharacteristic;
let infoSoftwareVersionCharacteristic;
let infoGlobalDividerCharacteristic;

let HardwareVersion = -1;
let SoftwareVersion = -1;

let dfuCharacteristic;

let GlobalFrequencyDivider = 20;

let accVauleDivider = (2 ^ 11) / 200;

let loggingActive = false;
let logdataAcc = [];
let logdataTemp;
let logdataTempOverheadLength;

let peakFreq = 0;

const fftLength = 4096;
const accUpdateDivider = 10;
let accUpdateDividerValue = 0;
let accData = Array.apply(null, { length: fftLength }).map(Number.call, _ => 0);
let accDataX = Array.apply(null, { length: fftLength }).map(Number.call, _ => 0);
let accDataY = Array.apply(null, { length: fftLength }).map(Number.call, _ => 0);
let accDataZ = Array.apply(null, { length: fftLength }).map(Number.call, _ => 0);
let accDataPointer = 0;
let tempTime = 0;
const TEMPERATURE_DIVIDER = 4;
let smapleFrequencyTemp = 5;
let temperature_time_divider = 60 / smapleFrequencyTemp;

let tempYMin = 1000;
let tempYMax = -1000;
const tempAxisAhead = 3;

const connectionButton_img = document.getElementById("img_connection");
const HPVSettings_img = document.getElementById("img_HPV");
const rangeSettings_img = document.getElementById("img_range");
const axisSettings_img = document.getElementById("img_axis");
const tempSettings_img = document.getElementById("img_temp");
const uploadSetting_img = document.getElementById("img_upload_settings");
const dfu_img = document.getElementById("img_dfu");
const log_img = document.getElementById("img_log");
const BLEsymbol_img = document.getElementById("img_BLEsymbol");
const statusText_p = document.getElementById("statusText");
const statusMag_p = document.getElementById("MagText");

const Connection_span = document.getElementById("span_tooltip_connection");
const HPVDropdownContent = document.getElementById("HPVDropdownContent_ul")
const rangeDropdownContent = document.getElementById("RangeDropdownContent_ul")
const axisDropdownContent = document.getElementById("AxisDropdownContent_ul")
const axisLimitDropdownContent = document.getElementById("AxisLimitDropdownContent_ul")
const tempDropdownContent = document.getElementById("TempDropdownContent_ul")

const trumLength_input = document.getElementById("trumLengthValue")
trumLength_input.addEventListener('change', cleanPeakFreq);
const beltWeight_input = document.getElementById("beltWeightValue")
beltWeight_input.addEventListener('change', cleanPeakFreq);
function cleanPeakFreq(){
  peakFreq = 0;
}
const toneFrequency_p = document.getElementById("toneFrequency")
const trumForce_p = document.getElementById("trumForce")

const titleFontSize = 25;
const chartFontColor = "rgb(200, 200, 200)";
const axisFontSize = 20;
const axisTickFontSize = 18;

const dfuCommand = new Uint8Array(1);
dfuCommand[0] = 1;

let initialCharacteristicRead = true;

let smapleFrequencyAcc = 3276.8;
let displayFrequencyrange = (smapleFrequencyAcc / 2);

let accChart;
let accChartData = new Array(fftLength / 2).fill({ x: 0, y: 0 }).map(
  (entry, index) => {
    return {
      x: index * (displayFrequencyrange / ((fftLength / 2) - 1)),
      y: null
    }
  }
);
let tempChart;

let checkForBLE = new Promise(function (resolve, reject) {
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
let wakeLock = null;

window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.log(`window.onerror:`);
  console.log('->msg:' + msg);
  console.log('->url:' + url);
  console.log('->lineNo:' + lineNo);
  console.log('->columnNo:' + columnNo);
  console.log('->error:' + error);
  return false;
}

function setup() {
  draw();
  checkForBLE.then(function (result) {
    if (result) {
      connectionButton_img.addEventListener('click', () => handleConnection());
      initAccChart();
      initTempChart();
      setupHPVDropdownContent(ADXL372accFilters);
      setupRangeDropdownContent(ADXL372Range);
      setupAxisDropdownContent(PossibleAxis);
      setupAxisLimitDropdownContent(PossibleAxisLimits);
      axisLimitDropdownContent.style.display = "none";
      document.getElementById("img_axis_limit").addEventListener('click', showAxisLimitDropdownContent);
      setupTempDropdownContent(TempSampling);
      HPVDropdownContent.addEventListener('click', (param) => updateChar8Bit(accelerometerFilterCharacteristic, param.target.id.replace(/\D/g, '')));
      rangeDropdownContent.addEventListener('click', (param) => updateChar8Bit(accelerometerRangeCharacteristic, param.target.id.replace(/\D/g, '')));
      axisDropdownContent.addEventListener('click', (param) => updateChar8Bit(accelerometerAxisCharacteristic, param.target.id.replace(/\D/g, '')));
      axisLimitDropdownContent.addEventListener('click', (param) => setXAxisLimit(param.target.id.replace(/\D/g, '')));
      tempDropdownContent.addEventListener('click', (param) => updateTemperatureChar(param.target.id.replace(/\D/g, '')));
    }
  }, function (err) {
    connectionButton_img.className = 'barActionInactiveImage';
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
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock was released');
    });
    console.log('Screen Wake Lock is active');
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};

function setXAxisLimit(dropdownID) {
  accChart.resetZoom();
  accChart.options.scales.xAxes[0].ticks.max = PossibleAxisLimits[dropdownID];
  accChart.options.scales.xAxes[0].ticks.stepSize = PossibleAxisLimits[dropdownID] / 20;
  accChart.update();
  localStorage.setItem('xLimit', dropdownID);
}

function loggingCallback() {
  // discard parameters
  logging();
}

function logging(abort = false) {
  if (loggingActive) {
    log_img.src = 'images/Log.svg';

    let dateNow = new Date(Date.now());
    let year = dateNow.getFullYear();
    let month = dateNow.getMonth() + 1;
    let day = dateNow.getDate();
    let hour = dateNow.getUTCHours() + 1;
    let minute = dateNow.getMinutes();

    // ACC    
    let csvBlobAcc = new Blob([[logdataAcc.join(`\n`)]], { type: "text/csv;charset=utf-8" });
    const blobUrlAcc = URL.createObjectURL(csvBlobAcc);
    const anchorElement = document.createElement("a");

    anchorElement.href = blobUrlAcc;
    anchorElement.download = `accData_` + year + `_` + month + `_` + day + `__` + hour + `_` + minute + `.csv`;

    anchorElement.click();

    /***************************************************************/
    // temporarydate = new Date(Date.now());
    // console.log(temporarydate.getMinutes() + ':' + temporarydate.getSeconds() + ',' + temporarydate.getMilliseconds());
    // console.log('after click');
    /***************************************************************/

    // Temp
    if (logdataTemp[0].length > logdataTempOverheadLength) {
      let csvBlobTemp = new Blob([logdataTemp], { type: "text/plain;charset=utf-8" });
      const blobUrlTemp = URL.createObjectURL(csvBlobTemp);
      const anchorElementTemp = document.createElement("a");

      anchorElementTemp.href = blobUrlTemp;
      anchorElementTemp.download = `tempData_` + year + `_` + month + `_` + day + `__` + hour + `_` + minute + `.csv`;
      anchorElementTemp.click();
    }

    loggingActive = false;
    activateSettings();
    
    logdataAcc = [];

  } else {
    if (!abort) {
      log_img.src = 'images/Log_active.svg';
      loggingActive = true;
      deactivateSettings();

      HP_Filter = ADXL372accFilters[accelerometerFilterCharacteristic.value.getUint8(0)];
      LP_Filter = ADXL372accLpFilters[accelerometerLpFilterCharacteristic.value.getUint8(0)];
      Range = AccRanges[accelerometerRangeCharacteristic.value.getUint8(0)];
      Axis = PossibleAxis[accelerometerAxisCharacteristic.value.getUint8(0)];
      smapleFrequencyAcc = SensorBaseFrequency / GlobalFrequencyDivider / accelerometerDividerCharacteristic.value.getUint8(0);

      let header = `log file of Accelerometer;Sample Frequenzy:;` + smapleFrequencyAcc + `;Hz;HP Filter:;` + HP_Filter + `;Hz;LP Filter:;` + LP_Filter + `;Hz;Range:;` + Range + `;g;Axis:;` + Axis + `;Vaule Divider to get [g]:;` + accVauleDivider;
      logdataAcc.push(header); //= `log file of Accelerometer;Sample Frequenzy:;` + smapleFrequencyAcc + `;Hz;HP Filter:;` + HP_Filter + `;Hz;LP Filter:;` + LP_Filter + `;Hz;Range:;` + Range + `;g;Axis:;` + Axis + `;Vaule Divider to get [g]:;` + accVauleDivider + `\n`;
      let subHeader;
      if(SoftwareVersion >= 3)
      {
        if (accelerometerAxisCharacteristic.value.getUint8(0) >= 1) { subHeader = Axis + `;Mag;Stamp`; }
        else { subHeader =  `x;y;z;Mag;Stamp`; }
      }
      else
      {
        if (accelerometerAxisCharacteristic.value.getUint8(0) >= 1) { subHeader = Axis + `;Stamp`; }
        else { subHeader =  `x;y;z;Stamp`; }
      }
      logdataAcc.push(subHeader); 
      logdataTemp = [`log file of Temperature Sonsor;Sample Frequenzy:;` + SensorBaseFrequency + `/` + temperatureDividerCharacteristic.value.getUint16(0, true) * GlobalFrequencyDivider + `;Hz\n`];
      logdataTemp[0] += `value;Stamp\n`;
      logdataTempOverheadLength = logdataTemp[0].length;
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
  let newFrequency = parseFloat(TempSampling[parseInt(newvalueIndex)]);
  let newDivider = SensorBaseFrequency / (GlobalFrequencyDivider * newFrequency);
  newDivider = Math.round(newDivider);
  updateChar16Bit(temperatureDividerCharacteristic, newDivider);
}
/************************************************************************/
// dropdown
window.onclick = function (event) {
  if (!(event.target.id === 'img_HPV')) {
    HPVDropdownContent.style.display = "none";
  }
  if (!(event.target.id === 'img_range')) {
    rangeDropdownContent.style.display = "none";
  }
  if (!(event.target.id === 'img_axis')) {
    axisDropdownContent.style.display = "none";
  }
  if (!(event.target.id === 'img_axis_limit')) {
    axisLimitDropdownContent.style.display = "none";
  }
  if (!(event.target.id === 'img_temp')) {
    tempDropdownContent.style.display = "none";
  }
  // console.log(event);
}

function showHPVDropdownContent() {
  if (HPVDropdownContent.style.display === "none") {
    HPVDropdownContent.style.display = "block";
  } else {
    HPVDropdownContent.style.display = "none";
  }
}

function showrangeDropdownContent() {
  if (rangeDropdownContent.style.display === "none") {
    rangeDropdownContent.style.display = "block";
  } else {
    rangeDropdownContent.style.display = "none";
  }
}

function showAxisDropdownContent() {
  if (axisDropdownContent.style.display === "none") {
    axisDropdownContent.style.display = "block";
  } else {
    axisDropdownContent.style.display = "none";
  }
}

function showAxisLimitDropdownContent() {
  if (axisLimitDropdownContent.style.display === "none") {
    axisLimitDropdownContent.style.display = "block";
  } else {
    axisLimitDropdownContent.style.display = "none";
  }
}

function showTempDropdownContent() {
  if (tempDropdownContent.style.display === "none") {
    tempDropdownContent.style.display = "block";
  } else {
    tempDropdownContent.style.display = "none";
  }
}

function setupHPVDropdownContent(filterlist) {
  HPVDropdownContent.innerHTML = `<li><p id="0" class="dropdownItem">off</p></li>`;
  let filterlistlength = filterlist.length;
  for (let index = 1; index < filterlistlength; index++) {
    HPVDropdownContent.innerHTML += `<li><p id="f` + index + `" class="dropdownItem">` + filterlist[index] + `Hz</p></li>`;
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
  rangeDropdownContent.innerHTML = ``;
  let rangelistlength = rangelist.length;
  for (let index = 0; index < rangelistlength; index++) {
    if (!(rangelist[index] === ' ')) {
      rangeDropdownContent.innerHTML += `<li><p id="r` + index + `" class="dropdownItem">` + rangelist[index] + `g</p></li>`;
    }
  }
}

function setupAxisDropdownContent(axislist) {
  axisDropdownContent.innerHTML = ``;
  let axislistlength = axislist.length;
  for (let index = 0; index < axislistlength; index++) {
    axisDropdownContent.innerHTML += `<li><p id="a` + index + `" class="dropdownItem">` + axislist[index] + `</p></li>`;
  }
}

function setupAxisLimitDropdownContent(axisLimitlist) {
  axisLimitDropdownContent.innerHTML = ``;
  let axisLimitlistlength = axisLimitlist.length;
  for (let index = 0; index < axisLimitlistlength; index++) {
    axisLimitDropdownContent.innerHTML += `<li><p id="l` + index + `" class="dropdownItem">` + axisLimitlist[index] + ` Hz</p></li>`;
  }
}

function setupTempDropdownContent(tempSamplinglist) {
  tempDropdownContent.innerHTML = ``;
  let tempSamplinglistlength = tempSamplinglist.length;
  for (let index = 0; index < tempSamplinglistlength; index++) {
    tempDropdownContent.innerHTML += `<li><p id="t` + index + `" class="dropdownItem">` + tempSamplinglist[index] + `</p></li>`;
  }
}
/************************************************************************/

function handleConnection() {
  if (isConnected) {
    onDisconnectButtonClick();
  } else {
    onButtonClick()
  }
}

function activateSettings() {
  HPVSettings_img.src = 'images/HPV.svg';
  rangeSettings_img.src = 'images/range.svg';
  axisSettings_img.src = 'images/axis.svg';
  tempSettings_img.src = 'images/Temp.svg';
  uploadSetting_img.src = 'images/upload.svg';
  dfu_img.src = 'images/dfu.svg';
  HPVSettings_img.addEventListener('click', showHPVDropdownContent);
  rangeSettings_img.addEventListener('click', showrangeDropdownContent);
  axisSettings_img.addEventListener('click', showAxisDropdownContent);
  tempSettings_img.addEventListener('click', showTempDropdownContent);
  uploadSetting_img.addEventListener('click', uploadSettingsToSensor);
  dfu_img.addEventListener('click', switchToDFUMode);
}

function deactivateSettings() {
  HPVSettings_img.src = 'images/HPV_gray.svg';
  rangeSettings_img.src = 'images/range_gray.svg';
  axisSettings_img.src = 'images/axis_gray.svg';
  tempSettings_img.src = 'images/Temp_gray.svg';
  uploadSetting_img.src = 'images/upload_gray.svg';
  dfu_img.src = 'images/dfu_gray.svg';
  HPVSettings_img.removeEventListener('click', showHPVDropdownContent);
  rangeSettings_img.removeEventListener('click', showrangeDropdownContent);
  axisSettings_img.removeEventListener('click', showAxisDropdownContent);
  tempSettings_img.removeEventListener('click', showTempDropdownContent);
  uploadSetting_img.removeEventListener('click', uploadSettingsToSensor);
  dfu_img.removeEventListener('click', switchToDFUMode);
}

function draw() {
  if (isConnected) {
    BLEsymbol_img.src = 'images/logoSB.svg';
    connectionButton_img.src = 'images/BLE_disconnect.svg';
    log_img.src = 'images/Log.svg';
    Connection_span.textContent = 'Disconnect from Sensor';
    activateSettings();
    log_img.addEventListener('click', loggingCallback);
    // Request a screen wake lock…
    requestWakeLock();
  } else {
    BLEsymbol_img.src = "images/logoSB_dis.svg";
    connectionButton_img.src = 'images/search.svg';
    log_img.src = 'images/Log_gray.svg';
    Connection_span.textContent = 'Start scanning for Sensors';
    deactivateSettings();
    log_img.removeEventListener('click', loggingCallback);
    // Release the screen wake lock…
    if (wakeLock !== null) {
      wakeLock.release();
      wakeLock = null;
    }
  }
}

function uploadSettingsToSensor() {
  let accelerometerDividerInputValue = Number(document.getElementById("inp_sli_accelerometerDivider").value);
  accelerometerDividerInputValue = Math.round(SensorBaseFrequency / (GlobalFrequencyDivider * accelerometerDividerInputValue));
  updateChar16Bit(accelerometerDividerCharacteristic, accelerometerDividerInputValue);

  let slider = document.getElementById("inp_sli_temperatureDivider");
  let temperatureDividerInputValue = mapLinearToLog(slider.value, slider.min, slider.max, temperatureFreqSlideMin, temperatureFreqSlideMax);
  temperatureDividerInputValue = Math.round(SensorBaseFrequency / (GlobalFrequencyDivider * temperatureDividerInputValue));
  setTimeout(() => {
    updateChar16Bit(temperatureDividerCharacteristic, temperatureDividerInputValue);
  }, 1000);

  // let voltageDividerInputValue = Number(document.getElementById('inp_num_voltageDivider').value);
  // voltageDividerInputValue = Math.round(SensorBaseFrequency / (GlobalFrequencyDivider * voltageDividerInputValue));
  // setTimeout(() => {
  //   updateChar16Bit(voltageDividerCharacteristic, voltageDividerInputValue);
  // }, 2000);
}

function switchToDFUMode() {
  console.log('dfuCharacteristic =' + dfuCharacteristic);
  dfuCharacteristic.writeValue(dfuCommand);
}

function onButtonClick() {
  bluetoothDevice = null;

  let options = {
    filters: [
      // { services: [accelerometerServiceUuid] },
      // { services: [temperatureServiceUuid] },
      // { name: 'Smart B' }, // only devices with ''
      { namePrefix: 'Smart' } // only devices starts with ''
    ],
    optionalServices: [
      accelerometerServiceUuid,
      temperatureServiceUuid,
      voltageServiceUuid,
      infoServiceUuid,
      dfuServiceUuid],
    // acceptAllDevices : true  // show all
  }

  console.log('Requesting Bluetooth Device...');
  statusText_p.innerHTML = `Scanning for Bluetooth Device`;
  navigator.bluetooth.requestDevice(options)
    .then(device => {
      console.log('Connecting to GATT Server...');
      statusText_p.innerHTML = `Connecting to GATT Server`;
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('Getting Services...');
      statusText_p.innerHTML = `Getting Services`;
      return server.getPrimaryServices();
    })
    .then(services => {
      console.log('Getting Characteristics...');
      statusText_p.innerHTML = `Getting Characteristics`;
      let queue = Promise.resolve();
      console.log('services: ', services);
      services.forEach(service => {
        queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
          if (service.uuid === accelerometerServiceUuid) {
            characteristics.forEach(characteristic => {
              if (characteristic.uuid === accelerometerFilterCharacteristicUuid) {
                accelerometerFilterCharacteristic = characteristic;
                accelerometerFilterCharacteristic.addEventListener('characteristicvaluechanged',
                  handleAccelerometerFilterCharacteristicChanged);
                setTimeout(() => {
                  accelerometerFilterCharacteristic.readValue()
                    .catch(error => {
                      console.warn('Argh! ' + error);
                      console.warn(`Fail while accelerometerFilterCharacteristic.readValue()`);
                      statusText_p.innerHTML = `Connection failed`;
                      bluetoothDevice.gatt.disconnect();
                      return;
                    });
                }, 200);
              } else if (characteristic.uuid === accelerometerLpFilterCharacteristicUuid) {
                accelerometerLpFilterCharacteristic = characteristic;
                accelerometerLpFilterCharacteristic.addEventListener('characteristicvaluechanged',
                  handleAccelerometerLpFilterCharacteristicChanged);
              } else if (characteristic.uuid === accelerometerRangeCharacteristicUuid) {
                accelerometerRangeCharacteristic = characteristic;
                accelerometerRangeCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerRangeCharacteristicChanged);
              } else if (characteristic.uuid === accelerometerDividerCharacteristicUuid) {
                accelerometerDividerCharacteristic = characteristic;
                accelerometerDividerCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerDividerCharacteristicChanged);
              } else if (characteristic.uuid === accelerometerAxisCharacteristicUuid) {
                accelerometerAxisCharacteristic = characteristic;
                accelerometerAxisCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerAxisCharacteristicChanged);
              } else if (characteristic.uuid === accelerometerDataCharacteristicUuid) {
                accelerometerDataCharacteristic = characteristic;
                accelerometerDataCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerDataCharacteristicChanged);
                if (document.getElementById("inp_check_accelerometer").checked) {
                  accelerometerDataCharacteristic.startNotifications()
                    .catch(error => {
                      console.warn('Argh! ' + error);
                      console.warn(`Fail while accelerometerDataCharacteristic.startNotifications()`);
                      statusText_p.innerHTML = `Connection failed`;
                      bluetoothDevice.gatt.disconnect();
                      return;
                    });
                }
              } else if (characteristic.uuid === accelerometerTypeCharacteristicUuid) {
                accelerometerTypeCharacteristic = characteristic;
                accelerometerTypeCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerTypeCharacteristicChanged);
              } else if (characteristic.uuid === accelerometerResolutionCharacteristicUuid) {
                accelerometerResolutionCharacteristic = characteristic;
                accelerometerResolutionCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerResolutionCharacteristicChanged);
              } else if (characteristic.uuid === accelerometerBinCharacteristicUuid) {
                accelerometerBinCharacteristic = characteristic;
                accelerometerBinCharacteristic.addEventListener('characteristicvaluechanged',
                  handleaccelerometerBinCharacteristicChanged);
              }
            });
          }
          else if (service.uuid === temperatureServiceUuid) {
            characteristics.forEach(characteristic => {
              if (characteristic.uuid === temperatureDividerCharacteristicUuid) {
                temperatureDividerCharacteristic = characteristic;
                temperatureDividerCharacteristic.addEventListener('characteristicvaluechanged',
                  handletemperatureDividerCharacteristicChanged);
              } else if (characteristic.uuid === temperatureDataCharacteristicUuid) {
                temperatureDataCharacteristic = characteristic;
                temperatureDataCharacteristic.addEventListener('characteristicvaluechanged',
                  handletemperatureDataCharacteristicChanged);
              }
            });
          }
          else if (service.uuid === voltageServiceUuid) {
            characteristics.forEach(characteristic => {
              if (characteristic.uuid === voltageDividerCharacteristicUuid) {
                voltageDividerCharacteristic = characteristic;
                voltageDividerCharacteristic.addEventListener('characteristicvaluechanged',
                  handlevoltageDividerCharacteristicChanged);
              } else if (characteristic.uuid === voltageDataCharacteristicUuid) {
                voltageDataCharacteristic = characteristic;
                voltageDataCharacteristic.addEventListener('characteristicvaluechanged',
                  handlevoltageDataCharacteristicChanged);
              }
            });
          }
          else if (service.uuid === infoServiceUuid) {
            characteristics.forEach(characteristic => {
              if (characteristic.uuid === infoHardwareVersionCharacteristicUuid) {
                infoHardwareVersionCharacteristic = characteristic;
                infoHardwareVersionCharacteristic.addEventListener('characteristicvaluechanged',
                  handleinfoHardwareVersionCharacteristicChanged);
              } else if (characteristic.uuid === infoSoftwareVersionCharacteristicUuid) {
                infoSoftwareVersionCharacteristic = characteristic;
                infoSoftwareVersionCharacteristic.addEventListener('characteristicvaluechanged',
                  handleinfoSoftwareVersionCharacteristicChanged);
              } else if (characteristic.uuid === infoGlobalDividerCharacteristicUuid) {
                infoGlobalDividerCharacteristic = characteristic;
                infoGlobalDividerCharacteristic.addEventListener('characteristicvaluechanged',
                  handleinfoGlobalDividerCharacteristicChanged);
              }
            });
          }
          else if (service.uuid === dfuServiceUuid) {
            characteristics.forEach(characteristic => {
              if (characteristic.uuid === dfuCharacteristicUuid) {
                dfuCharacteristic = characteristic;
                dfuCharacteristic.addEventListener('characteristicvaluechanged',
                  handledfuCharacteristicChanged);
                // dfuCharacteristic.startNotifications()
                //   .catch(error => {
                //     console.warn('Argh! ' + error);
                //     console.warn(`Fail while dfuCharacteristic.startNotifications()`);
                //     statusText_p.innerHTML = `Connection failed`;
                //     bluetoothDevice.gatt.disconnect();
                //     return;
                //   });
              }
            });
          }
          isConnected = true;
          draw();
          statusText_p.innerHTML = `Connection complete`;
        }));
      });
      return queue;
    })
    .catch(error => {
      console.warn('Argh! ' + error);
      statusText_p.innerHTML = error;
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

function onDisconnectButtonClick() {
  if (!bluetoothDevice) {
    return;
  }
  console.log('Disconnecting from Bluetooth Device...');
  if (bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  } else {
    console.log('Bluetooth Device is already disconnected');
  }
}

function onDisconnected(event) {
  console.log('Bluetooth Device disconnected');
  statusText_p.innerHTML = `Disconnected`;
  isConnected = false;
  logging(true);
  draw();
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
    if (accChart.data.datasets.length === 3) {
      accChart.options.legend.display = true;
      accChart.data.datasets.splice(1, 2);
    }

    if (accChart.data.datasets[0].label !== PossibleAxis[event.target.value.getUint8(0)]) { accChart.data.datasets[0].label = PossibleAxis[event.target.value.getUint8(0)]; }

    let logdataAccTemp = '';
    for (let i = 1; i < dataValueLength - 4; i += 2) {
      let value = event.target.value.getInt16(i);
      let magValue
      if (SoftwareVersion >= 3) {
        magValue = (value >> 14) & 0x3;
        statusMag_p.innerHTML=magValue;
        value = convert12to16int(value);
      }
      accData[accDataPointer] = value / accVauleDivider;
      if (loggingActive) {
        try {
          if (i < (dataValueLength - 6)) {
            logdataAccTemp += (value + `;` + magValue + `;` + `\n`);
          } else {
            logdataAccTemp += (value + `;` + magValue + `;`);
          }
        } catch (error) {
          console.warn('Argh! ' + error);
          statusText_p.innerHTML = error;
        }
      }
      if (accDataPointer < fftLength - 1)
        accDataPointer++;
      else
        accDataPointer = 0;
    }
    if (loggingActive) {
      try {
        logdataAccTemp += (event.target.value.getInt32(dataValueLength - 4));
        logdataAcc.push(logdataAccTemp);
      } catch (error) {
        console.warn('Argh! ' + error);
        statusText_p.innerHTML = error;
      }
    }

    if (accUpdateDividerValue >= accUpdateDivider) {
      accUpdateDividerValue = 0;
      let fftdata = [...accData];
      fftTotalResult = getTotalFFT(fftdata).slice(0, fftLength / 2);

      let indexOfMax = fftTotalResult.slice(1).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) + 1;
      newPeakFreq = Object.values(accChartData)[indexOfMax].x

      if (peakFreq != newPeakFreq)
      {
        peakFreq = newPeakFreq;
        // console.log(newPeakFreq);
        // console.log(Number(trumLength_input.value));
        // console.log(Number(beltWeight_input.value));

        toneFrequency_p.innerHTML = newPeakFreq.toFixed(1);
        trumForce_p.innerHTML = (newPeakFreq**2 * 4 * Number(beltWeight_input.value) * (Number(trumLength_input.value)/1000)**2).toFixed(1);
      }

      accChart.data.datasets[0].data = accChart.data.datasets[0].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResult[index]
          }
        }
      );
      accChart.update();
      if (loggingActive) {
        /* console.log(`logdataAcc size = ` + logdataAcc.length);
        console.log(`jsHeapSizeLimit = ` + performance.memory.jsHeapSizeLimit);
        console.log(`usedJSHeapSize = ` + performance.memory.usedJSHeapSize);
        console.log(`totalJSHeapSize = ` + performance.memory.totalJSHeapSize); */
        if (performance.memory.jsHeapSizeLimit === performance.memory.usedJSHeapSize) {
          console.log(`Stop logging (memory problems)`);
          logging(true);
        }
      }
    }
    else
      accUpdateDividerValue++;
  } else if (event.target.value.getUint8(0) == 0) {
    if (accChart.data.datasets.length === 1) {
      accChart.data.datasets[0].label = 'x Axis';
      accChart.options.legend.display = true;
      let newDataset = {
        label: 'y Axis',
        data: accChartData,
        backgroundColor: 'rgb(68, 192, 37)',
        borderColor: 'rgb(68, 192, 37)',
        fill: false,
        pointHoverBackgroundColor: 'rgb(218, 15, 15)',
        borderWidth: 3
      };
      let newDataset2 = {
        label: 'z Axis',
        data: accChartData,
        backgroundColor: 'rgb(22, 11, 179)',
        borderColor: 'rgb(22, 11, 179)',
        fill: false,
        pointHoverBackgroundColor: 'rgb(218, 15, 15)',
        borderWidth: 3
      };
      accChart.data.datasets.push(newDataset);
      accChart.data.datasets.push(newDataset2);
    }

    let logdataAccTemp = '';
    for (let i = 1; i < dataValueLength - 4;) {
      let valueX = event.target.value.getInt16(i);
      i = i + 2;
      let valueY = event.target.value.getInt16(i);
      i = i + 2;
      let valueZ = event.target.value.getInt16(i);
      i = i + 2;

      accDataX[accDataPointer] = valueX / accVauleDivider;
      accDataY[accDataPointer] = valueY / accVauleDivider;
      accDataZ[accDataPointer] = valueZ / accVauleDivider;
      if (loggingActive) {
        try {
          if (i <= (dataValueLength - 4 - 2 * 3)) {
            logdataAccTemp += (valueX + `;` + valueY + `;` + valueZ + `;` + `\n`);
          } else {
            logdataAccTemp += (valueX + `;` + valueY + `;` + valueZ + `;`);
          }
        } catch (error) {
          console.warn('Argh! ' + error);
          statusText_p.innerHTML = error;
        }
      }
      if (accDataPointer < fftLength - 1)
        accDataPointer++;
      else
        accDataPointer = 0;
    }
    if (loggingActive) {
      try {
        logdataAccTemp += (event.target.value.getInt32(dataValueLength - 4));
        logdataAcc.push(logdataAccTemp);
      } catch (error) {
        console.warn('Argh! ' + error);
        statusText_p.innerHTML = error;
      }
    }

    if (accUpdateDividerValue >= accUpdateDivider * 3) {
      accUpdateDividerValue = 0;
      let fftdataX = [...accDataX];
      let fftdataY = [...accDataY];
      let fftdataZ = [...accDataZ];
      let fftTotalResultX = getTotalFFT(fftdataX).slice(0, fftLength / 2);
      let fftTotalResultY = getTotalFFT(fftdataY).slice(0, fftLength / 2);
      let fftTotalResultZ = getTotalFFT(fftdataZ).slice(0, fftLength / 2);

      accChart.data.datasets[0].data = accChart.data.datasets[0].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResultX[index]
          }
        }
      );
      accChart.data.datasets[1].data = accChart.data.datasets[1].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResultY[index]
          }
        }
      );
      accChart.data.datasets[2].data = accChart.data.datasets[2].data.map(
        (entry, index) => {
          return {
            x: entry.x,
            y: fftTotalResultZ[index]
          }
        }
      );
      accChart.update();
      if (loggingActive) {
        if (performance.memory.jsHeapSizeLimit === performance.memory.usedJSHeapSize) {
          console.log(`Stop logging (memory problems)`);
          logging(true);
        }
      }
    }
    else
      accUpdateDividerValue++;
  }
}

function handletemperatureDataCharacteristicChanged(event) {
  let dataValueLength = event.target.value.byteLength;
  for (let i = 0; i < dataValueLength - 4; i += 2) {
    tempTime = tempTime + (1 / temperature_time_divider);
    let value = event.target.value.getInt16(i) / TEMPERATURE_DIVIDER;
    if (value < tempYMin)
      tempYMin = value;

    if (value > tempYMax)
      tempYMax = value;

    tempChart.data.datasets[0].data.push({ x: tempTime, y: value });

    if (loggingActive) {
      if (i < (dataValueLength - 6)) {
        logdataTemp[0] += (value + `;` + `\n`);
      } else {
        logdataTemp[0] += (value + `;`);
      }
    }
  }
  if (loggingActive) {
    logdataTemp[0] += (event.target.value.getInt32(dataValueLength - 4) + '\n');
  }

  tempChart.resetZoom();
  tempChart.config.options.scales.yAxes[0].ticks.min = Math.round(tempYMin - tempAxisAhead);
  tempChart.config.options.scales.yAxes[0].ticks.max = Math.round(tempYMax + tempAxisAhead);
  if (tempTime - TEMP_TIME_WINDOW > 0) {
    tempChart.config.options.scales.xAxes[0].ticks.min = Math.round((tempTime - TEMP_TIME_WINDOW) * 10) / 10;
    tempChart.config.options.scales.xAxes[0].ticks.max = Math.round(tempTime * 10) / 10;
  }

  tempChart.update();
}

function handleAccelerometerFilterCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer high pass filter = ' + ADXL372accFilters[accelerometerFilterCharacteristic.value.getUint8(0)] + ' Hz');
  if (initialCharacteristicRead){
    accelerometerLpFilterCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerLpFilterCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleAccelerometerLpFilterCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer low pass filter = ' + ADXL372accLpFilters[accelerometerLpFilterCharacteristic.value.getUint8(0)] + ' Hz');
  if (initialCharacteristicRead) {
    accelerometerRangeCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerRangeCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleaccelerometerRangeCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer range = ' + ADXL372Range[accelerometerRangeCharacteristic.value.getUint8(0)]);
  if (initialCharacteristicRead) {
    accelerometerDividerCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerDividerCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleaccelerometerDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  if (initialCharacteristicRead) {
    accelerometerAxisCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerAxisCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
  else{
    if (typeof accelerometerLpFilterCharacteristic !== "undefined" &&
      accelerometerLpFilterCharacteristic.value !== null) {
      accelerometerLpFilterCharacteristic.readValue()
        .catch(error => {
          console.warn('Argh! ' + error);
          console.warn(`Fail while accelerometerLpFilterCharacteristic.readValue()`);
          statusText_p.innerHTML = `Connection failed`;
          bluetoothDevice.gatt.disconnect();
          return;
        });
    }
  }
}

function handleaccelerometerAxisCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer transmitting Axis = ' + PossibleAxis[accelerometerAxisCharacteristic.value.getUint8(0)]);
  if (initialCharacteristicRead) {
    accelerometerTypeCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerTypeCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleaccelerometerTypeCharacteristicChanged(event) {
  console.log('Accelerometer Type = ' + usedAccelerometer[accelerometerTypeCharacteristic.value.getUint8(0)]);
  if (initialCharacteristicRead) {
    accelerometerResolutionCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerResolutionCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleaccelerometerResolutionCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Accelerometer Resolution = ' + accelerometerResolutionCharacteristic.value.getUint8(0) + ' Bit');
  if (initialCharacteristicRead) {
    accelerometerBinCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while accelerometerBinCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleaccelerometerBinCharacteristicChanged(event) {
  console.log('Accelerometer bin size = ' + accelerometerBinCharacteristic.value.getUint8(0) + ' values');
  if (initialCharacteristicRead) {
    temperatureDividerCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while temperatureDividerCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handletemperatureDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  if (initialCharacteristicRead) {
    voltageDividerCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while voltageDividerCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handlevoltageDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  if (initialCharacteristicRead) {
    infoHardwareVersionCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while infoHardwareVersionCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handlevoltageDataCharacteristicChanged(event) {
  // TODO 
}

function handleinfoHardwareVersionCharacteristicChanged(event) {
  HardwareVersion = infoHardwareVersionCharacteristic.value.getUint8(0);
  console.log('Hardware Version = ' + HardwareVersion);
  if (initialCharacteristicRead) {
    infoSoftwareVersionCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while infoSoftwareVersionCharacteristic.readValue()`);
        statusTexwarnt_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleinfoSoftwareVersionCharacteristicChanged(event) {
  SoftwareVersion = infoSoftwareVersionCharacteristic.value.getUint8(0);
  console.log('Software Version = ' + SoftwareVersion);
  if (initialCharacteristicRead) {
    infoGlobalDividerCharacteristic.readValue()
      .catch(error => {
        console.warn('Argh! ' + error);
        console.warn(`Fail while infoGlobalDividerCharacteristic.readValue()`);
        statusText_p.innerHTML = `Connection failed`;
        bluetoothDevice.gatt.disconnect();
        return;
      });
  }
}

function handleinfoGlobalDividerCharacteristicChanged(event) {
  handleSetupCharacteristicChanged();
  console.log('Global frequency divider = ' + GlobalFrequencyDivider);
  if (initialCharacteristicRead) {
    if (document.getElementById("inp_check_temperature").checked) {
      temperatureDataCharacteristic.startNotifications()
        .catch(error => {
          console.warn('Argh! ' + error);
          console.warn(`Fail while temperatureDataCharacteristic.startNotifications()`);
          statusText_p.innerHTML = `Connection failed`;
          bluetoothDevice.gatt.disconnect();
          return;
        });
    }
    setTimeout(() => {
      dfuCharacteristic.startNotifications()
        .catch(error => {
          console.warn('Argh! ' + error);
          console.warn(`Fail while dfuCharacteristic.startNotifications()`);
          statusText_p.innerHTML = `Connection failed`;
          bluetoothDevice.gatt.disconnect();
          return;
        });
    }, 1000);
    
    // setTimeout(() => {
    //   if (document.getElementById("inp_check_voltage").checked) {
    //     voltageDataCharacteristic.startNotifications()
    //       .catch(error => {
    //         console.warn('Argh! ' + error);
    //         console.warn(`Fail while voltageDataCharacteristic.startNotifications()`);
    //         statusText_p.innerHTML = `Connection failed`;
    //         bluetoothDevice.gatt.disconnect();
    //         return;
    //       });
    //   }
    // }, 2000);
  }

  initialCharacteristicRead = false;
}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function handledfuCharacteristicChanged(event) {
  let response = (dfuCharacteristic.value.getUint8(0) << 16) |
    (dfuCharacteristic.value.getUint8(1) << 8) |
    dfuCharacteristic.value.getUint8(2);
  console.log('dfu response = 0x' + response.toString(16));
  switch (dfuCharacteristic.value.getUint8(2)) {
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
    typeof infoGlobalDividerCharacteristic !== "undefined" &&
    typeof accelerometerResolutionCharacteristic !== "undefined" &&
    typeof accelerometerRangeCharacteristic !== "undefined" &&
    typeof temperatureDividerCharacteristic !== "undefined" &&
    typeof accelerometerFilterCharacteristic !== "undefined" &&
    typeof accelerometerLpFilterCharacteristic !== "undefined" &&
    typeof accelerometerAxisCharacteristic !== "undefined" &&
    typeof accelerometerDividerCharacteristic !== "undefined"
  ) {
    if (
      infoGlobalDividerCharacteristic.value !== null &&
      accelerometerResolutionCharacteristic.value !== null &&
      accelerometerRangeCharacteristic.value !== null &&
      temperatureDividerCharacteristic.value !== null &&
      accelerometerFilterCharacteristic.value !== null &&
      accelerometerLpFilterCharacteristic.value !== null &&
      accelerometerAxisCharacteristic.value !== null &&
      accelerometerDividerCharacteristic.value !== null) {
      GlobalFrequencyDivider = infoGlobalDividerCharacteristic.value.getUint8(0);
      accVauleDivider = Math.pow(2, (accelerometerResolutionCharacteristic.value.getUint8(0) - 1)) / AccRanges[accelerometerRangeCharacteristic.value.getUint8(0)];

      smapleFrequencyTemp = SensorBaseFrequency / temperatureDividerCharacteristic.value.getUint16(0, true) / GlobalFrequencyDivider;
      
      document.getElementById("inp_num_accelerometerDivider").innerHTML = SensorBaseFrequency / (accelerometerDividerCharacteristic.value.getUint16(0, true) * GlobalFrequencyDivider) + ' Hz';
      document.getElementById("inp_sli_accelerometerDivider").value = SensorBaseFrequency / (accelerometerDividerCharacteristic.value.getUint16(0, true) * GlobalFrequencyDivider);
      console.log('Accelerometer frequency divider = ' + accelerometerDividerCharacteristic.value.getUint16(0, true));
      console.log('--> frequency = ' + SensorBaseFrequency / accelerometerDividerCharacteristic.value.getUint16(0, true) / GlobalFrequencyDivider + ' Hz');

      document.getElementById("inp_num_temperatureDivider").innerHTML = Math.round((SensorBaseFrequency / temperatureDividerCharacteristic.value.getUint16(0, true) / GlobalFrequencyDivider) * 1000) / 1000 + ' Hz';
      let slider = document.getElementById("inp_sli_temperatureDivider");
      slider.value = mapLogToLinear(SensorBaseFrequency / (temperatureDividerCharacteristic.value.getUint16(0, true) * GlobalFrequencyDivider), slider.min, slider.max, temperatureFreqSlideMin, temperatureFreqSlideMax);
      console.log('Temperature frequency divider = ' + temperatureDividerCharacteristic.value.getUint16(0, true));
      console.log('--> frequency = ' + SensorBaseFrequency / temperatureDividerCharacteristic.value.getUint16(0, true) / GlobalFrequencyDivider + ' Hz');

      // document.getElementById("inp_num_voltageDivider").value = SensorBaseFrequency / (voltageDividerCharacteristic.value.getUint16(0, true) * GlobalFrequencyDivider);
      voltageFreqNumber();
      console.log('Voltage frequency divider = ' + voltageDividerCharacteristic.value.getUint16(0, true));
      console.log('--> frequency = ' + SensorBaseFrequency / voltageDividerCharacteristic.value.getUint16(0, true) / GlobalFrequencyDivider + ' Hz');

      valueString += 'HP Filter: ' + ADXL372accFilters[accelerometerFilterCharacteristic.value.getUint8(0)] + 'Hz,';
      valueString += 'LP Filter: ' + ADXL372accLpFilters[accelerometerLpFilterCharacteristic.value.getUint8(0)] + 'Hz,';
      valueString += ' Range: +-' + AccRanges[accelerometerRangeCharacteristic.value.getUint8(0)] + 'g,';
      valueString += ' Axis: ' + PossibleAxis[accelerometerAxisCharacteristic.value.getUint8(0)];
      valueString += ' Temperature: ' + Number(smapleFrequencyTemp).toFixed(2) + `Hz`;

      temperature_time_divider = 60 * smapleFrequencyTemp;

      document.getElementById("setupInfoText").innerHTML = valueString;

      smapleFrequencyAcc = SensorBaseFrequency / GlobalFrequencyDivider / accelerometerDividerCharacteristic.value.getUint8(0);
      displayFrequencyrange = (smapleFrequencyAcc / 2);

      accChart.data.datasets[0].data = accChart.data.datasets[0].data.map(
        (entry, index) => {
          return {
            x: index * (displayFrequencyrange / ((fftLength / 2) - 1)),
            y: entry.y
          }
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
  inputNumTempFreq.innerHTML = Math.round(mapLinearToLog(slider.value, slider.min, slider.max, temperatureFreqSlideMin, temperatureFreqSlideMax) * 100) / 100 + ' Hz';
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
  slider.value = mapLogToLinear(inputNumTempFreq.value, slider.min, slider.max, temperatureFreqSlideMin, temperatureFreqSlideMax);
}

function voltageFreqNumber() {
  // document.getElementById("inp_sli_voltageDivider").value = document.getElementById("inp_num_voltageDivider").value;
}

function ValidateAccelerometerSelection() {
  if (typeof accelerometerDataCharacteristic !== "undefined") {
    if (document.getElementById("inp_check_accelerometer").checked) {
      accelerometerDataCharacteristic.startNotifications()
        .catch(error => {
          console.log('Error: accelerometerDataCharacteristic.startNotifications()');
          return;
        });
    } else {
      accelerometerDataCharacteristic.stopNotifications()
        .catch(error => {
          console.log('Error: accelerometerDataCharacteristic.stopNotifications()');
          return;
        });
    }
  }
}

function ValidateTemperatureSelection() {
  if (typeof temperatureDataCharacteristic !== "undefined") {
    if (document.getElementById("inp_check_temperature").checked) {
      temperatureDataCharacteristic.startNotifications()
        .catch(error => {
          console.log('Error: temperatureDataCharacteristic.startNotifications()');
          return;
        });
    } else {
      temperatureDataCharacteristic.stopNotifications()
        .catch(error => {
          console.log('Error: temperatureDataCharacteristic.startNotifications()');
          return;
        });
    }
  }
}

function ValidateVoltageSelection() {
  if (typeof voltageDataCharacteristic !== "undefined") {
    if (document.getElementById("inp_check_temperature").checked) {
      voltageDataCharacteristic.startNotifications()
        .catch(error => {
          console.log('Error: voltageDataCharacteristic.startNotifications()');
          return;
        });
    } else {
      voltageDataCharacteristic.stopNotifications()
        .catch(error => {
          console.log('Error: voltageDataCharacteristic.startNotifications()');
          return;
        });
    }
  }
}

function initAccChart() {
  let xAxesTicksMax = PossibleAxisLimits[2];
  let xAxesTicksStepSize = PossibleAxisLimits[2] / 20;
  let xLimitStored = localStorage.getItem('xLimit')
  if (null !== xLimitStored) {
    xAxesTicksMax = PossibleAxisLimits[xLimitStored];
    xAxesTicksStepSize = PossibleAxisLimits[xLimitStored] / 20;
  }

  accChart = new Chart(document.getElementById('accChart').getContext('2d'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'accData',
        data: accChartData,
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
        fontSize: titleFontSize,
        fontColor: chartFontColor,
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
            fontSize: axisFontSize,
            fontColor: chartFontColor,
          },
          ticks: {
            fontSize: axisTickFontSize,
            beginAtZero: true,
            stepSize: xAxesTicksStepSize,
            max: xAxesTicksMax,
            fontColor: chartFontColor,
          }
        }],
        yAxes: [{
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'Normalized amplitude',
            fontSize: axisFontSize,
            fontColor: chartFontColor,
          },
          ticks: {
            fontSize: axisTickFontSize,
            beginAtZero: true,
            fontColor: chartFontColor,
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
  tempChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
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
        fontSize: titleFontSize,
        fontColor: chartFontColor,
      },
      legend: {
        display: false,
        labels: {
          fontColor: chartFontColor,
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
            fontSize: axisFontSize,
            fontColor: chartFontColor,
          },
          ticks: {
            fontSize: axisTickFontSize,
            // beginAtZero: true,
            stepSize: 0.1,
            min: 0,
            max: TEMP_TIME_WINDOW,
            maxTicksLimit: 11,
            fontColor: chartFontColor,
          }
        }],
        yAxes: [{
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'Temperature in °C',
            fontSize: axisFontSize,
            fontColor: chartFontColor,
          },
          ticks: {
            fontSize: axisTickFontSize,
            min: 20,
            max: 30,
            fontColor: chartFontColor,
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