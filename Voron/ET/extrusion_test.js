// TODO hard-code Stealthburner/Afterburner toolhead clearance

/**
 * Extrusion Calibration Pattern
 * Copyright (C) 2019 Sineos [https://github.com/Sineos]
 * Copyright (C) 2022 RealDeuce [https://github.com/RealDeuce]
 * Copyright (C) 2022 CNCKitchen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
'use strict';

// Settings version of localStorage
// Increase if default settings are changed / amended

const SETTINGS_VERSION = '1.0';
const Z_round = -3;
const XY_round = -4;
const EXT_round = -5;

function genGcode() {
	let PRINTER = $('#PRINTER').val(),
	    FILAMENT = $('#FILAMENT').val(),
	    FILENAME = $('#FILENAME').val(),
	    FILAMENT_DIAMETER = parseFloat($('#FIL_DIA').val()),
	    START_GCODE = $('#START_GCODE').val(),
	    END_GCODE = $('#END_GCODE').val(),
	    SPEED_MOVE = parseInt($('#MOVE_SPEED').val()),
	    SPEED_RETRACT = parseInt($('#RETRACT_SPEED').val()),
	    SPEED_UNRETRACT = parseInt($('#UNRETRACT_SPEED').val()),
	    RETRACT_DIST = parseFloat($('#RETRACTION').val()),
	    BED_X = parseInt($('#BEDSIZE_X').val()),
	    BED_Y = parseInt($('#BEDSIZE_Y').val()),
	    BED_MARGIN = parseInt($('#BED_MARGIN').val()),
	    FAN_SPEED = parseFloat($('#FAN_SPEED').val()),
	    F_START = parseFloat($('#F_START').val()),
	    F_END = parseFloat($('#F_END').val()),
	    F_STEP = parseFloat($('#F_STEP').val()),
	    T_START = parseFloat($('#T_START').val()),
	    T_END = parseFloat($('#T_END').val()),
	    T_STEP = parseFloat($('#T_STEP').val()),
	    USE_MMS = $('#MM_S').prop('checked'),
	    SPEED_PRIME = parseFloat($('#PRIME_SPEED').val()),
	    PRIME_DWELL = parseFloat($('#DWELL_PRIME').val()),
	    PRIME_LENGTH = parseFloat($('#PRIME_LENGTH').val()),
	    PRIME_AMOUNT = parseFloat($('#PRIME_AMOUNT').val()),
	    WIPE_LENGTH = parseFloat($('#WIPE_LENGTH').val()),
	    BLOB_HEIGHT = parseFloat($('#BLOB_HEIGHT').val()),
	    EXTRUSION_AMOUNT = parseFloat($('#EXTRUSION_AMOUNT').val()),
	    txtArea = document.getElementById('gcodetextarea');

	if (USE_MMS) {
		SPEED_MOVE *= 60;
		SPEED_PRIME *= 60;
		SPEED_RETRACT *= 60;
		SPEED_UNRETRACT *= 60;
	}

	// Now switch to same variable names CNCKitchen used...
	const bedWidth = BED_X;
	const bedLength = BED_Y;
	const bedMargin = BED_MARGIN;
	const filamentDiameter = FILAMENT_DIAMETER;
	const movementSpeed = SPEED_MOVE;
	const stabilizationTime = PRIME_DWELL;
	const fanSpeed = FAN_SPEED;
	const primeLength = PRIME_LENGTH;
	const primeAmount = PRIME_AMOUNT;
	const primeSpeed = SPEED_PRIME;
	const wipeLength = WIPE_LENGTH;
	const retractionDistance = RETRACT_DIST;
	const unretractionSpeed = SPEED_UNRETRACT;
	const retractionSpeed = SPEED_RETRACT;
	const blobHeight = BLOB_HEIGHT;
	const extrusionAmount = EXTRUSION_AMOUNT;
	const startFlow = F_START;
	const flowOffset = F_STEP;
	const endFlow = F_END;
	const startTemp = T_START;
	const tempOffset = T_STEP;
	// Note, I added this one - Deuce
	const endTemp = T_END;

	let flowSteps = parseInt(Math.abs(startFlow - endFlow) / Math.abs(flowOffset), 10) + 1;
	let tempSteps = parseInt(Math.abs(startTemp - endTemp) / Math.abs(tempOffset), 10) + 1;
	let xSpacing = parseInt(((bedWidth - 2) * bedMargin - ((primeLength + wipeLength) * tempSteps)) / (tempSteps - 1), 10);
	let ySpacing = parseInt((bedLength - 2 * bedMargin) / (tempSteps - 1), 10);

	// Start G-code for pattern
	let e_script = '; ### Klipper Extrusion Calibration Pattern ###\n' +
	               '; ### Derived from CNC Kitchen Auto Flow Pattern Generator 0.93 ###\n' +
	               '; ### 02/04/26 Stefan Hermann ###\n' +
	               '; -------------------------------------------\n' +
	               ';\n' +
	               '; Printer: ' + PRINTER + '\n' +
	               '; Filament: ' + FILAMENT + '\n' +
	               '; Created: ' + new Date() + '\n' +
	               ';\n' +
	               '; Settings Printer:\n' +
	               '; Filament Diameter = ' + FILAMENT_DIAMETER + ' mm\n' +
	               '; Start G-code = ' + START_GCODE.replace(/^/gm, '; ')+ '\n' +
	               '; End G-code = ' + END_GCODE.replace(/^/gm, '; ')+ '\n' +
	               '; Retraction Distance = ' + RETRACT_DIST + ' mm\n' +
	               '; Fan Speed = ' + FAN_SPEED + ' %\n' +
	               ';\n' +
	               '; Settings Print Bed:\n' +
	               '; Bed Size X = ' + BED_X + ' mm\n' +
	               '; Bed Size Y = ' + BED_Y + ' mm\n' +
	               '; Bed Margin = ' + BED_MARGIN + ' mm\n' +
	               ';\n' +
	               '; Settings Speed:\n' +
	               '; Movement Speed = ' + SPEED_MOVE + ' mm/min\n' +
	               '; Retract Speed = ' + SPEED_RETRACT + ' mm/min\n' +
	               '; Unretract Speed = ' + SPEED_UNRETRACT + ' mm/min\n' +
	               ';\n' +
	               '; Settings Pattern:\n' +
	               '; Starting Value Flow = ' + F_START + '\n' +
	               '; Ending Value Flow = ' + F_END + '\n' +
	               '; Flow Stepping = ' + F_STEP + '\n' +
	               '; Starting Value Temperature = ' + T_START + '\n' +
	               '; Ending Value Temperature = ' + T_END + '\n' +
	               '; Temperature Stepping = ' + T_STEP + '\n' +
	               ';\n' +
	               '; Settings Advance:\n' +
	               '; Blob Height = ' + BLOB_HEIGHT + '\n' +
	               '; Extrusion Amount = ' + EXTRUSION_AMOUNT + '\n' +
	               '; Prime Length = ' + PRIME_LENGTH + '\n' +
	               '; Prime Amount = ' + PRIME_AMOUNT + '\n' +
	               '; Prime Printing Speed = ' + PRIME_SPEED + '\n' +
	               '; Wipe Length = ' + WIPE_LENGTH + '\n' +
	               '; Dwell Time = ' + PRIME_DWELL + ' s\n' +
	               ';\n' +
	               '; prepare printing\n' +
	               ';\n' +
	               START_GCODE + '\n' +
	               'G21 ; Millimeter units\n' +
	               'G90 ; Absolute XYZ\n' +
	               'M83 ; Relative E\n' +
	               'G92 E0 ; Reset extruder distance\n' +
	               'M106 S' + Math.round(FAN_SPEED * 2.55) + '\n';

	// DoE column
	for (let c = 1; c <= tempSteps; c++) {
		// Comment
		e_script += '\n';
		e_script += ";####### " + (startTemp + (c - 1) * tempOffset) + "C\n";
		// Set temp
		e_script += "G4 S0 ; Dwell\n";
		e_script += "M109 R" + (startTemp + (c - 1) * tempOffset) + '\n';
    
		// Output for each test
		for (let r = 1; r <= flowSteps; r++) {
			// Message
			e_script += '\n';
			e_script += ";####### " + (startFlow + (r - 1) * flowOffset) + "mm³/s\n";
			e_script += "M117 " + (startTemp + (c - 1) * tempOffset) + "°C // " + (startFlow + (r - 1) * flowOffset) + "mm³/s\n";
			// Move to start
			e_script += "G0 X" + (Math.abs(bedMargin) + ((c - 1) * (primeLength + wipeLength + xSpacing))) + " Y" + ((bedLength - bedMargin) - (r - 1) * ySpacing) + " Z" + (0.5 + blobHeight + 5) + " F" + movementSpeed + "\n";
			e_script += "G4 S" + stabilizationTime + "; Stabilize\n";
			e_script += "G0 Z0.3 ; Drop down\n";
			e_script += "G1 X" + (Math.abs(bedMargin) + primeLength + ((c - 1) * (primeLength + wipeLength + xSpacing))) + " E" + primeAmount + " F" + primeSpeed + " ;Prime\n";
			e_script += "G1 E" + (-1 * retractionDistance) + " F" + retractionSpeed + "; Retract\n";
			e_script += "G0 X" + (Math.abs(bedMargin) + primeLength + wipeLength + ((c - 1) * (primeLength + wipeLength + xSpacing))) + " F" + movementSpeed + " ; Wipe\n";
			e_script += "G0 Z0.5 ; Lift\n";
			e_script += "G1 E" + (retractionDistance) + " F" + unretractionSpeed + " ; De-Retract\n";
			// calculate Extrusionspeed
			const extrusionSpeed = Math.round10(blobHeight / (extrusionAmount / ((startFlow + (r - 1) * flowOffset) / (Math.atan(1) * filamentDiameter * filamentDiameter) * 60)), -2);
			e_script += "G1 Z" + (0.5 + blobHeight) + " E" + extrusionAmount + " F" + extrusionSpeed + " ; Extrude\n";
			e_script += "G1 E" + (-1 * retractionDistance) + " F" + retractionSpeed + " ; Retract\n";
			e_script += "G0 Z" + (0.5 + blobHeight + 5) + "; Lift\n";
			e_script += "G0 X" + (Math.abs(bedMargin) + ((c - 1) * (primeLength + wipeLength + xSpacing))) + " Y" + ((bedLength - bedMargin) - (r - 1) * ySpacing) + " F" + movementSpeed + '\n';
			e_script += "G92 E0 ; Reset Extruder\n";
		}
	}

	e_script += ';\n' +
              '; FINISH\n' +
              ';\n' +
              END_GCODE + '\n' +
              ';';

	txtArea.value = e_script;
}

// Save content of textarea to file using
// https://github.com/eligrey/FileSaver.js
function saveTextAsFile() {
  var textToWrite = document.getElementById('gcodetextarea').value,
      textFileAsBlob = new Blob([textToWrite], {type: 'text/plain'}),
      usersFilename = document.getElementById('FILENAME').value,
      filename = usersFilename || '',
      fileNameToSaveAs = filename + 'padvance.gcode';
  if (textToWrite) {
    saveAs(textFileAsBlob, fileNameToSaveAs);
  } else {
    alert('Generate G-code first');
    return;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
(function() {

  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */

  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || Number(exp) === 0) {
      return Math[type](value);
    }
    value = Number(value);
    exp = Number(exp);
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](Number(value[0] + 'e' + (value[1] ? (Number(value[1]) - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return Number(value[0] + 'e' + (value[1] ? (Number(value[1]) + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
}());

// get the number of decimal places of a float
function getDecimals(num) {
  var match = (String(num)).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    return num;
  }
  var decimalPlaces = Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? Number(match[2]) : 0));
  return decimalPlaces;
}

// save current settings as localStorage object
function setLocalStorage() {
  var FILAMENT_DIAMETER = parseFloat($('#FIL_DIA').val()),
      NOZZLE_DIAMETER = parseFloat($('#NOZ_DIA').val()),
      NOZZLE_LINE_RATIO = parseFloat($('#NOZ_LIN_R').val()),
      START_GCODE = $('#START_GCODE').val(),
      END_GCODE = $('#END_GCODE').val(),
      SPEED_SLOW = parseInt($('#SLOW_SPEED').val()),
      SPEED_FAST = parseInt($('#FAST_SPEED').val()),
      SPEED_MOVE = parseInt($('#MOVE_SPEED').val()),
      SPEED_RETRACT = parseInt($('#RETRACT_SPEED').val()),
      ACCELERATION = parseInt($('#PRINT_ACCL').val()),
      RETRACT_DIST = parseFloat($('#RETRACTION').val()),
      BED_X = parseInt($('#BEDSIZE_X').val()),
      BED_Y = parseInt($('#BEDSIZE_Y').val()),
      NULL_CENTER = $('#CENTER_NULL').prop('checked'),
      HEIGHT_LAYER = parseFloat($('#LAYER_HEIGHT').val()),
      FAN_SPEED = parseFloat($('#FAN_SPEED').val()),
      EXT_MULT = parseFloat($('#EXTRUSION_MULT').val()),
      PATTERN_TYPE = $('#TYPE_PATTERN').val(),
      K_START = parseFloat($('#K_START').val()),
      K_END = parseFloat($('#K_END').val()),
      K_STEP = parseFloat($('#K_STEP').val()),
      PRINT_DIR = $('#DIR_PRINT').val(),
      LINE_SPACING = parseFloat($('#SPACE_LINE').val()),
      USE_FRAME = $('#FRAME').prop('checked'),
      USE_PRIME = $('#PRIME').prop('checked'),
      EXT_MULT_PRIME = parseFloat($('#PRIME_EXT').val()),
      SPEED_PRIME = parseFloat($('#PRIME_SPEED').val()),
      PRIME_DWELL = parseFloat($('#DWELL_PRIME').val()),
      LENGTH_SLOW = parseFloat($('#SLOW_LENGTH').val()),
      LENGTH_FAST = parseFloat($('#FAST_LENGTH').val()),
      Z_OFFSET = parseFloat($('#OFFSET_Z').val()),
      USE_FWR = $('#USE_FWR').prop('checked'),
      USE_MMS = $('#MM_S').prop('checked'),
      USE_LINENO = $('#LINE_NO').prop('checked');

  var settings = {
    'Version' : SETTINGS_VERSION,
    'FILAMENT_DIAMETER': FILAMENT_DIAMETER,
    'NOZZLE_DIAMETER': NOZZLE_DIAMETER,
    'NOZZLE_LINE_RATIO': NOZZLE_LINE_RATIO,
    'START_GCODE': START_GCODE,
    'END_GCODE': END_GCODE,
    'SPEED_SLOW': SPEED_SLOW,
    'SPEED_FAST': SPEED_FAST,
    'SPEED_MOVE': SPEED_MOVE,
    'SPEED_RETRACT': SPEED_RETRACT,
    'ACCELERATION': ACCELERATION,
    'RETRACT_DIST': RETRACT_DIST,
    'BED_X': BED_X,
    'BED_Y': BED_Y,
    'NULL_CENTER': NULL_CENTER,
    'HEIGHT_LAYER': HEIGHT_LAYER,
    'FAN_SPEED' : FAN_SPEED,
    'EXT_MULT': EXT_MULT,
    'PATTERN_TYPE': PATTERN_TYPE,
    'K_START': K_START,
    'K_END': K_END,
    'K_STEP': K_STEP,
    'PRINT_DIR': PRINT_DIR,
    'LINE_SPACING': LINE_SPACING,
    'USE_FRAME': USE_FRAME,
    'USE_PRIME': USE_PRIME,
    'EXT_MULT_PRIME': EXT_MULT_PRIME,
    'SPEED_PRIME' : SPEED_PRIME,
    'PRIME_DWELL': PRIME_DWELL,
    'LENGTH_SLOW': LENGTH_SLOW,
    'LENGTH_FAST': LENGTH_FAST,
    'Z_OFFSET': Z_OFFSET,
    'USE_FWR': USE_FWR,
    'USE_MMS': USE_MMS,
    'USE_LINENO': USE_LINENO
  };

  const lsSettings = JSON.stringify(settings);
  window.localStorage.setItem('LIN_SETTINGS', lsSettings);
}

// toggle between mm/s and mm/min speed settings
function speedToggle() {
  var SPEED_SLOW = $('#SLOW_SPEED').val(),
      SPEED_FAST = $('#FAST_SPEED').val(),
      SPEED_MOVE = $('#MOVE_SPEED').val(),
      SPEED_RETRACT = $('#RETRACT_SPEED').val(),
      SPEED_PRIME = $('#PRIME_SPEED').val();
      SPEED_UNRETRACT = $('#UNRETRACT_SPEED').val();
  if ($('#MM_S').is(':checked')) {
    SPEED_SLOW = $('#SLOW_SPEED').val();
    SPEED_FAST = $('#FAST_SPEED').val();
    SPEED_MOVE = $('#MOVE_SPEED').val();
    SPEED_RETRACT = $('#RETRACT_SPEED').val();
    SPEED_UNRETRACT = $('#UNRETRACT_SPEED').val();
    SPEED_PRIME = $('#PRIME_SPEED').val();
    $('#SLOW_SPEED').val(SPEED_SLOW / 60);
    $('#FAST_SPEED').val(SPEED_FAST / 60);
    $('#MOVE_SPEED').val(SPEED_MOVE / 60);
    $('#RETRACT_SPEED').val(SPEED_RETRACT / 60);
    $('#UNRETRACT_SPEED').val(SPEED_UNRETRACT / 60);
    $('#PRIME_SPEED').val(SPEED_PRIME / 60);
  } else {
    SPEED_SLOW = $('#SLOW_SPEED').val();
    SPEED_FAST = $('#FAST_SPEED').val();
    SPEED_MOVE = $('#MOVE_SPEED').val();
    SPEED_RETRACT = $('#RETRACT_SPEED').val();
    SPEED_UNRETRACT = $('#UNRETRACT_SPEED').val();
    SPEED_PRIME = $('#PRIME_SPEED').val();
    $('#SLOW_SPEED').val(SPEED_SLOW * 60);
    $('#FAST_SPEED').val(SPEED_FAST * 60);
    $('#MOVE_SPEED').val(SPEED_MOVE * 60);
    $('#RETRACT_SPEED').val(SPEED_RETRACT * 60);
    $('#UNRETRACT_SPEED').val(SPEED_UNRETRACT * 60);
    $('#PRIME_SPEED').val(SPEED_PRIME * 60);
  }
}

// toggle between standard and alternate pattern type
function patternType() {
  if ($('#TYPE_PATTERN').val() === 'alt') {
    if ($('#FRAME').is(':checked')) {
      $('#FRAME').prop('checked', false);
      $('#FRAME').prop('disabled', true);
      $('label[for=FRAME]').css({opacity: 0.5});
    } else {
      $('#FRAME').prop('disabled', true);
      $('label[for=FRAME]').css({opacity: 0.5});
    }
  } else if ($('#TYPE_PATTERN').val() === 'std'){
    $('#FRAME').prop('disabled', false);
    $('label[for=FRAME]').css({opacity: 1});
  }
}

// toggle prime relevant options
function togglePrime() {
  if ($('#PRIME').is(':checked')) {
    $('#PRIME_EXT').prop('disabled', false);
    $('label[for=PRIME_EXT]').css({opacity: 1});
  } else {
    $('#PRIME_EXT').prop('disabled', true);
    $('label[for=PRIME_EXT]').css({opacity: 0.5});
  }
}

// toggle between standard and firmware retract
function toggleRetract() {
  if ($('#USE_FWR').is(':checked')) {
    $('#RETRACT_SPEED').prop('disabled', true);
    $('label[for=RETRACT_SPEED]').css({opacity: 0.5});
  } else {
    $('#RETRACT_SPEED').prop('disabled', false);
    $('label[for=RETRACT_SPEED]').css({opacity: 1.0});
  }
}

// sanity checks for pattern / bed size
function validateInput() {
  var testNaN = {
      // do not use parseInt or parseFloat for validating, since both
      // functions will have special parsing characteristics leading to
      // false numeric validation
      BEDSIZE_X: $('#BEDSIZE_X').val(),
      BEDSIZE_Y: $('#BEDSIZE_Y').val(),
      K_START: $('#K_START').val(),
      K_END: $('#K_END').val(),
      K_STEP: $('#K_STEP').val(),
      SPACE_LINE: $('#SPACE_LINE').val(),
      SLOW_SPEED: $('#SLOW_SPEED').val(),
      FAST_SPEED: $('#FAST_SPEED').val(),
      SLOW_LENGTH: $('#SLOW_LENGTH').val(),
      FAST_LENGTH: $('#FAST_LENGTH').val(),
      FIL_DIA: $('#FIL_DIA').val(),
      NOZ_DIA: $('#NOZ_DIA').val(),
      NOZ_LIN_R: $('#NOZ_LIN_R').val(),
      LAYER_HEIGHT: $('#LAYER_HEIGHT').val(),
      FAN_SPEED: $('#FAN_SPEED').val(),
      EXTRUSION_MULT: $('#EXTRUSION_MULT').val(),
      PRIME_EXT: $('#PRIME_EXT').val(),
      OFFSET_Z: $('#OFFSET_Z').val(),
      MOVE_SPEED: $('#MOVE_SPEED').val(),
      RETRACT_SPEED: $('#RETRACT_SPEED').val(),
      PRINT_ACCL: $('#PRINT_ACCL').val(),
      RETRACTION: $('#RETRACTION').val(),
      PRIME_SPEED: $('#PRIME_SPEED').val(),
      DWELL_PRIME: $('#DWELL_PRIME').val()
    },
    selectDir = $('#DIR_PRINT'),
    printDir = selectDir.val(),
    usePrime = $('#PRIME').prop('checked'),
    useLineNo = $('#LINE_NO').prop('checked'),
    sizeY = ((parseFloat(testNaN['K_END']) - parseFloat(testNaN['K_START'])) / parseFloat(testNaN['K_STEP']) * parseFloat(testNaN['SPACE_LINE'])) + 25, // +25 with ref marking
    sizeX = (2 * parseFloat(testNaN['SLOW_LENGTH'])) + parseFloat(testNaN['FAST_LENGTH']) + (usePrime ? 10 : 0) + (useLineNo ? 8 : 0),
    printDirRad = printDir * Math.PI / 180,
    fitWidth = Math.round10(Math.abs(sizeX * Math.cos(printDirRad)) + Math.abs(sizeY * Math.sin(printDirRad)), 0),
    fitHeight = Math.round10(Math.abs(sizeX * Math.sin(printDirRad)) + Math.abs(sizeY * Math.cos(printDirRad)), 0),
    decimals = getDecimals(parseFloat(testNaN['K_STEP'])),
    invalidDiv = 0;

  // Start clean
  $('#K_START,#K_END,#K_STEP,#SPACE_LINE,#SLOW_LENGTH,#FAST_LENGTH,#FIL_DIA,#NOZ_DIA,#LAYER_HEIGHT,#EXTRUSION_MULT,#PRIME_EXT,#OFFSET_Z,#NOZ_LIN_R,'
     + '#START_GCODE,#END_GCODE,#MOVE_SPEED,#RETRACT_SPEED,#UNRETRACT_SPEED,#PRINT_ACCL,#RETRACTION,#PRIME_SPEED,#DWELL_PRIME,#FAST_SPEED,#SLOW_SPEED').each((i,t) => {
    t.setCustomValidity('');
    const tid = $(t).attr('id');
    $(`label[for=${tid}]`).removeClass();
  });
  $('#warning1').hide();
  $('#warning2').hide();
  $('#warning3').hide();
  $('#button').prop('disabled', false);

  // Check for proper numerical values
  Object.keys(testNaN).forEach((k) => {
    if ((isNaN(testNaN[k]) && !isFinite(testNaN[k])) || testNaN[k].trim().length === 0) {
      $('label[for=' + k + ']').addClass('invalidNumber');
      $('#' + k)[0].setCustomValidity('The value is not a proper number.');
      $('#warning3').text('Some values are not proper numbers. Check highlighted Settings.');
      $('#warning3').addClass('invalidNumber');
      $('#warning3').show();
      $('#button').prop('disabled', true);
    }
  });

  // Check if Pressure Advance Stepping is a multiple of the Pressure Advance Range
  if ((Math.round10(parseFloat(testNaN['K_END']) - parseFloat(testNaN['K_START']), PA_round) * Math.pow(10, decimals)) % (parseFloat(testNaN['K_STEP']) * Math.pow(10, decimals)) !== 0) {
    $('label[for=K_START]').addClass('invalidDiv');
    $('#K_START')[0].setCustomValidity('Pressure Advance range cannot be cleanly divided.');
    $('label[for=K_END]').addClass('invalidDiv');
    $('#K_END')[0].setCustomValidity('Pressure Advance range cannot be cleanly divided.');
    $('label[for=K_STEP]').addClass('invalidDiv');
    $('#K_STEP')[0].setCustomValidity('Pressure Advance range cannot be cleanly divided.');
    $('#warning1').text('Your Pressure Advance range cannot be cleanly divided. Check highlighted Pattern Settings.');
    $('#warning1').addClass('invalidDiv');
    $('#warning1').show();
    $('#button').prop('disabled', true);
    invalidDiv = 1;
  }

  // Check if pattern settings exceed bed size
  if (fitWidth > (parseInt(testNaN['BEDSIZE_X']) - 5)) {
    $('label[for=SLOW_LENGTH]').addClass('invalidSize');
    $('#SLOW_LENGTH')[0].setCustomValidity('Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your X bed size.');
    $('label[for=FAST_LENGTH]').addClass('invalidSize');
    $('#FAST_LENGTH')[0].setCustomValidity('Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your X bed size.');
    $((invalidDiv ? '#warning2' : '#warning1')).text('Your Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your X bed size. Check highlighted Pattern Settings.');
    $((invalidDiv ? '#warning2' : '#warning1')).addClass('invalidSize');
    $((invalidDiv ? '#warning2' : '#warning1')).show();
  }

  if (fitHeight > (parseInt(testNaN['BEDSIZE_Y']) - 5)) {
    $('label[for=K_START]').addClass('invalidSize');
    $('#K_START')[0].setCustomValidity('Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your Y bed size.');
    $('label[for=K_END]').addClass('invalidSize');
    $('#K_END')[0].setCustomValidity('Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your Y bed size.');
    $('label[for=K_STEP]').addClass('invalidSize');
    $('#K_STEP')[0].setCustomValidity('Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your Y bed size.');
    $('label[for=SPACE_LINE]').addClass('invalidSize');
    $('#SPACE_LINE')[0].setCustomValidity('Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your Y bed size.');
    $((invalidDiv ? '#warning2' : '#warning1')).text('Your Pattern size (x: ' + fitWidth + ', y: ' + fitHeight + ') exceeds your Y bed size. Check highlighted Pattern Settings.');
    $((invalidDiv ? '#warning2' : '#warning1')).addClass('invalidSize');
    $((invalidDiv ? '#warning2' : '#warning1')).show();
  }
}

$(window).load(() => {
  // Adapt textarea to cell size
  var TXTAREAHEIGHT = $('.txtareatd').height();
  $('.calibpat #gcodetextarea').css({'height': (TXTAREAHEIGHT) + 'px'});

  // create tab index dynamically
  $(':input:not(:hidden)').each(function(i) {
    $(this).attr('tabindex', i + 1);
  });

  // Get localStorage data
  var lsSettings = window.localStorage.getItem('LIN_SETTINGS');

  if (lsSettings) {
    var settings = jQuery.parseJSON(lsSettings);
    if (!settings['Version'] || settings['Version'] != SETTINGS_VERSION) {
      window.localStorage.removeItem('LIN_SETTINGS');
      alert('Script settings have been updated. Saved settings are reset to default values');
    }
    else {
      $('#FIL_DIA').val(settings['FILAMENT_DIAMETER']);
      $('#NOZ_DIA').val(settings['NOZZLE_DIAMETER']);
      $('#NOZ_LIN_R').val(settings['NOZZLE_LINE_RATIO']);
      $('#START_GCODE').val(settings['START_GCODE']);
      $('#END_GCODE').val(settings['END_GCODE']);
      $('#SLOW_SPEED').val(settings['SPEED_SLOW']);
      $('#FAST_SPEED').val(settings['SPEED_FAST']);
      $('#MOVE_SPEED').val(settings['SPEED_MOVE']);
      $('#RETRACT_SPEED').val(settings['SPEED_RETRACT']);
      $('#PRINT_ACCL').val(settings['ACCELERATION']);
      $('#RETRACTION').val(settings['RETRACT_DIST']);
      $('#BEDSIZE_X').val(settings['BED_X']);
      $('#BEDSIZE_Y').val(settings['BED_Y']);
      $('#CENTER_NULL').prop('checked', settings['NULL_CENTER']);
      $('#LAYER_HEIGHT').val(settings['HEIGHT_LAYER']);
      $('#FAN_SPEED').val(settings['FAN_SPEED']);
      $('#EXTRUSION_MULT').val(settings['EXT_MULT']);
      $('#TYPE_PATTERN').val(settings['PATTERN_TYPE']);
      $('#K_START').val(settings['K_START']);
      $('#K_END').val(settings['K_END']);
      $('#K_STEP').val(settings['K_STEP']);
      $('#DIR_PRINT').val(settings['PRINT_DIR']);
      $('#SPACE_LINE').val(settings['LINE_SPACING']);
      $('#FRAME').prop('checked', settings['USE_FRAME']);
      $('#PRIME').prop('checked', settings['USE_PRIME']);
      $('#PRIME_EXT').val(settings['EXT_MULT_PRIME']);
      $('#PRIME_SPEED').val(settings['SPEED_PRIME']);
      $('#DWELL_PRIME').val(settings['PRIME_DWELL']);
      $('#SLOW_LENGTH').val(settings['LENGTH_SLOW']);
      $('#FAST_LENGTH').val(settings['LENGTH_FAST']);
      $('#OFFSET_Z').val(settings['Z_OFFSET']);
      $('#USE_FWR').prop('checked', settings['USE_FWR']);
      $('#MM_S').prop('checked', settings['USE_MMS']);
      $('#LINE_NO').prop('checked', settings['USE_LINENO']);

      //patternType();
      //toggleRetract();
    }
  }

  // toggle between mm/s and mm/min speeds
  $('#MM_S').change(speedToggle);

  // toggle prime relevant html elements
  $('#PRIME').change(togglePrime);

  // frame and alternate pattern are mutually exclusive
  $('#TYPE_PATTERN').change(patternType);

  // Change retract type
  $('#USE_FWR').change(toggleRetract);

});
