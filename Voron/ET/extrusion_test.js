"use strict";

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
const FLOW_round = 0;
const TEMP_round = 0;

// TODO: this doesn't leave room for blobs...
const X_clearance = 35;
const Y_clearance = 45;

function calcSteps(start, end, offset) {
	return parseInt(Math.abs(start - end) / Math.abs(offset), 10) + 1;
}

function genGcode() {
	const PRINTER = $('#PRINTER').val(),
	      FILAMENT = $('#FILAMENT').val(),
	      FILENAME = $('#FILENAME').val(),
	      FILAMENT_DIAMETER = parseFloat($('#FIL_DIA').val()),
	      START_GCODE = $('#START_GCODE').val(),
	      END_GCODE = $('#END_GCODE').val(),
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
	      PRIME_DWELL = parseFloat($('#DWELL_PRIME').val()),
	      PRIME_LENGTH = parseFloat($('#PRIME_LENGTH').val()),
	      PRIME_AMOUNT = parseFloat($('#PRIME_AMOUNT').val()),
	      WIPE_LENGTH = parseFloat($('#WIPE_LENGTH').val()),
	      BLOB_HEIGHT = parseFloat($('#BLOB_HEIGHT').val()),
	      EXTRUSION_AMOUNT = parseFloat($('#EXTRUSION_AMOUNT').val());

	let SPEED_MOVE = parseInt($('#MOVE_SPEED').val()),
	    SPEED_RETRACT = parseInt($('#RETRACT_SPEED').val()),
	    SPEED_UNRETRACT = parseInt($('#UNRETRACT_SPEED').val()),
	    SPEED_PRIME = parseFloat($('#PRIME_SPEED').val()),
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

	const flowSteps = calcSteps(startFlow, endFlow, flowOffset);
	const tempSteps = calcSteps(startTemp, endTemp, tempOffset);
	const xSpacing = parseInt((bedWidth - 2 * bedMargin - ((primeLength + wipeLength) * tempSteps)) / (tempSteps - 1), 10);
	const ySpacing = parseInt((bedLength - 2 * bedMargin) / (flowSteps - 1), 10);

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
      fileNameToSaveAs = filename + '_extrusion.gcode';
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
	const settings = {
		'Version' : SETTINGS_VERSION,
		'PRINTER' : $('#PRINTER').val(),
		'FILAMENT' : $('#FILAMENT').val(),
		'FILENAME' : $('#FILENAME').val(),
		'FILAMENT_DIAMETER' : parseFloat($('#FIL_DIA').val()),
		'START_GCODE' : $('#START_GCODE').val(),
		'END_GCODE' : $('#END_GCODE').val(),
		'RETRACT_DIST' : parseFloat($('#RETRACTION').val()),
		'BED_X' : parseInt($('#BEDSIZE_X').val()),
		'BED_Y' : parseInt($('#BEDSIZE_Y').val()),
		'BED_MARGIN' : parseInt($('#BED_MARGIN').val()),
		'FAN_SPEED' : parseFloat($('#FAN_SPEED').val()),
		'F_START' : parseFloat($('#F_START').val()),
		'F_END' : parseFloat($('#F_END').val()),
		'F_STEP' : parseFloat($('#F_STEP').val()),
		'T_START' : parseFloat($('#T_START').val()),
		'T_END' : parseFloat($('#T_END').val()),
		'T_STEP' : parseFloat($('#T_STEP').val()),
		'USE_MMS' : $('#MM_S').prop('checked'),
		'PRIME_DWELL' : parseFloat($('#DWELL_PRIME').val()),
		'PRIME_LENGTH' : parseFloat($('#PRIME_LENGTH').val()),
		'PRIME_AMOUNT' : parseFloat($('#PRIME_AMOUNT').val()),
		'WIPE_LENGTH' : parseFloat($('#WIPE_LENGTH').val()),
		'BLOB_HEIGHT' : parseFloat($('#BLOB_HEIGHT').val()),
		'EXTRUSION_AMOUNT' : parseFloat($('#EXTRUSION_AMOUNT').val()),
		'SPEED_MOVE' : parseInt($('#MOVE_SPEED').val()),
		'SPEED_RETRACT' : parseInt($('#RETRACT_SPEED').val()),
		'SPEED_UNRETRACT' : parseInt($('#UNRETRACT_SPEED').val()),
		'SPEED_PRIME' : parseFloat($('#PRIME_SPEED').val())
	};

	const lsSettings = JSON.stringify(settings);
	window.localStorage.setItem('ET_SETTINGS', lsSettings);
}

// toggle between mm/s and mm/min speed settings
function speedToggle() {
	const SPEED_MOVE = parseInt($('#MOVE_SPEED').val()),
	      SPEED_RETRACT = parseInt($('#RETRACT_SPEED').val()),
	      SPEED_UNRETRACT = parseInt($('#UNRETRACT_SPEED').val()),
	      SPEED_PRIME = parseFloat($('#PRIME_SPEED').val());

	if ($('#MM_S').is(':checked')) {
		$('#MOVE_SPEED').val(SPEED_MOVE / 60);
		$('#RETRACT_SPEED').val(SPEED_RETRACT / 60);
		$('#UNRETRACT_SPEED').val(SPEED_UNRETRACT / 60);
		$('#PRIME_SPEED').val(SPEED_PRIME / 60);
	} else {
		$('#MOVE_SPEED').val(SPEED_MOVE * 60);
		$('#RETRACT_SPEED').val(SPEED_RETRACT * 60);
		$('#UNRETRACT_SPEED').val(SPEED_UNRETRACT * 60);
		$('#PRIME_SPEED').val(SPEED_PRIME * 60);
	}
}

// sanity checks for pattern / bed size
function validateInput() {
	const testNaN = {
		// do not use parseInt or parseFloat for validating, since both
		// functions will have special parsing characteristics leading to
		// false numeric validation
		FIL_DIA : $('#FIL_DIA').val(),
		RETRACTION : $('#RETRACTION').val(),
		BEDSIZE_X : $('#BEDSIZE_X').val(),
		BEDSIZE_Y : $('#BEDSIZE_Y').val(),
		BED_MARGIN : $('#BED_MARGIN').val(),
		FAN_SPEED : $('#FAN_SPEED').val(),
		F_START : $('#F_START').val(),
		F_END : $('#F_END').val(),
		F_STEP : $('#F_STEP').val(),
		T_START : $('#T_START').val(),
		T_END : $('#T_END').val(),
		T_STEP : $('#T_STEP').val(),
		DWELL_PRIME : $('#DWELL_PRIME').val(),
		PRIME_LENGTH : $('#PRIME_LENGTH').val(),
		PRIME_AMOUNT : $('#PRIME_AMOUNT').val(),
		WIPE_LENGTH : $('#WIPE_LENGTH').val(),
		BLOB_HEIGHT : $('#BLOB_HEIGHT').val(),
		EXTRUSION_AMOUNT : $('#EXTRUSION_AMOUNT').val()
	};

	const F_START = parseFloat($('#F_START').val()),
	      F_END = parseFloat($('#F_END').val()),
	      F_STEP = parseFloat($('#F_STEP').val()),
	      T_START = parseFloat($('#T_START').val()),
	      T_END = parseFloat($('#T_END').val()),
	      T_STEP = parseFloat($('#T_STEP').val()),
	      BED_X = parseInt($('#BEDSIZE_X').val()),
	      BED_Y = parseInt($('#BEDSIZE_Y').val()),
	      BED_MARGIN = parseInt($('#BED_MARGIN').val()),
	      PRIME_LENGTH = parseFloat($('#PRIME_LENGTH').val()),
	      WIPE_LENGTH = parseFloat($('#WIPE_LENGTH').val()),
	      flowSteps = calcSteps(F_START, F_END, F_STEP),
	      tempSteps = calcSteps(T_START, T_END, T_STEP),
	      xSpacing = parseInt((BED_X - 2 * BED_MARGIN - ((PRIME_LENGTH + WIPE_LENGTH) * tempSteps)) / (tempSteps - 1), 10),
	      ySpacing = parseInt((BED_Y - 2 * BED_MARGIN) / (flowSteps - 1), 10),
	      fDecimals = getDecimals(parseFloat(testNaN['F_STEP'])),
	      tDecimals = getDecimals(parseFloat(testNaN['T_STEP']));
	let invalidDiv = 0;

	// Start clean
	$('#FIL_DIA,#RETRACTION,#BEDSIZE_X,#BEDSIZE_Y,#BED_MARGIN,#FAN_SPEED,#F_START,#F_END,#F_STEP,'
	    + '#T_START,#T_END,#T_STEP,#DWELL_PRIME,#PRIME_LENGTH,#PRIME_AMOUNT,#WIPE_LENGTH,#BLOB_HEIGHT,#EXTRUSION_AMOUNT').each((i,t) => {
		t.setCustomValidity('');
		const tid = $(t).attr('id');
		$(`label[for=${tid}]`).removeClass();
	});
	$('#warning1').hide();
	$('#warning2').hide();
	$('#warning3').hide();
	$('#warning4').hide();
	$('#warning5').hide();
	$('#button').prop('disabled', false);

	// Check for proper numerical values
	Object.keys(testNaN).forEach((k) => {
		if ((isNaN(testNaN[k]) && !isFinite(testNaN[k])) || testNaN[k].trim().length === 0) {
			$('label[for=' + k + ']').addClass('invalidNumber');
			$('#' + k)[0].setCustomValidity('The value is not a proper number.');
			$('#warning1').text('Some values are not proper numbers. Check highlighted Settings.');
			$('#warning1').addClass('invalidNumber');
			$('#warning1').show();
			$('#button').prop('disabled', true);
		}
	});

	// Check if Flow Stepping is a multiple of the Flow Range
	if ((Math.round10(parseFloat(testNaN['F_END']) - parseFloat(testNaN['F_START']), FLOW_round) * Math.pow(10, fDecimals)) % (parseFloat(testNaN['F_STEP']) * Math.pow(10, fDecimals)) !== 0) {
		$('label[for=F_START]').addClass('invalidDiv');
		$('#F_START')[0].setCustomValidity('Flow range cannot be cleanly divided.');
		$('label[for=F_END]').addClass('invalidDiv');
		$('#F_END')[0].setCustomValidity('Flow range cannot be cleanly divided.');
		$('label[for=F_STEP]').addClass('invalidDiv');
		$('#F_STEP')[0].setCustomValidity('Flow range cannot be cleanly divided.');
		$('#warning2').text('Your Flow range cannot be cleanly divided. Check highlighted Pattern Settings.');
		$('#warning2').addClass('invalidDiv');
		$('#warning2').show();
		$('#button').prop('disabled', true);
		invalidDiv = 1;
	}

	// Check if Temperature Stepping is a multiple of the Temperature Range
	if ((Math.round10(parseFloat(testNaN['T_END']) - parseFloat(testNaN['T_START']), TEMP_round) * Math.pow(10, tDecimals)) % (parseFloat(testNaN['T_STEP']) * Math.pow(10, tDecimals)) !== 0) {
		$('label[for=T_START]').addClass('invalidDiv');
		$('#T_START')[0].setCustomValidity('Temperature range cannot be cleanly divided.');
		$('label[for=T_END]').addClass('invalidDiv');
		$('#T_END')[0].setCustomValidity('Temperature range cannot be cleanly divided.');
		$('label[for=T_STEP]').addClass('invalidDiv');
		$('#T_STEP')[0].setCustomValidity('Temperature range cannot be cleanly divided.');
		$('#warning3').text('Your Temperature range cannot be cleanly divided. Check highlighted Pattern Settings.');
		$('#warning3').addClass('invalidDiv');
		$('#warning3').show();
		$('#button').prop('disabled', true);
		invalidDiv = 1;
	}

	// Check if pattern settings result in collision
	if (ySpacing < Y_clearance) {
		$('label[for=F_START]').addClass('invalidDiv');
		$('#F_START')[0].setCustomValidity('Flow range results in blob collisions.');
		$('label[for=F_END]').addClass('invalidDiv');
		$('#F_END')[0].setCustomValidity('Flow range results in blob collisions.');
		$('label[for=F_STEP]').addClass('invalidDiv');
		$('#F_STEP')[0].setCustomValidity('Flow range results in blow collisions.');
		$('#warning4').text('Your Flow range would print blobs too close together, and the printhead would collide with them. Check highlighted Pattern Settings.');
		$('#warning4').addClass('invalidDiv');
		$('#warning4').show();
		$('#button').prop('disabled', true);
		invalidDiv = 1;
	}

	if ((xSpacing + PRIME_LENGTH + WIPE_LENGTH) < X_clearance) {
		$('label[for=T_START]').addClass('invalidDiv');
		$('#T_START')[0].setCustomValidity('Temperature range results in blob collisions.');
		$('label[for=T_END]').addClass('invalidDiv');
		$('#T_END')[0].setCustomValidity('Temperature range results in blob collisions.');
		$('label[for=T_STEP]').addClass('invalidDiv');
		$('#T_STEP')[0].setCustomValidity('Temperature range results in blow collisions.');
		$('#warning5').text('Your Temperature range would print blobs too close together, and the printhead would collide with them. Check highlighted Pattern Settings.');
		$('#warning5').addClass('invalidDiv');
		$('#warning5').show();
		$('#button').prop('disabled', true);
		invalidDiv = 1;
	}
}

$(window).load(() => {
	// Adapt textarea to cell size
	let TXTAREAHEIGHT = $('.txtareatd').height();
	$('.calibpat #gcodetextarea').css({'height': (TXTAREAHEIGHT) + 'px'});

	// create tab index dynamically
	$(':input:not(:hidden)').each(function(i) {
		$(this).attr('tabindex', i + 1);
	});

	// Get localStorage data
	let lsSettings = window.localStorage.getItem('ET_SETTINGS');

	if (lsSettings) {
		var settings = jQuery.parseJSON(lsSettings);
		if (!settings['Version'] || settings['Version'] != SETTINGS_VERSION) {
			window.localStorage.removeItem('ET_SETTINGS');
			alert('Script settings have been updated. Saved settings are reset to default values');
		}
		else {
			$('#PRINTER').val(settings['PRINTER']),
			$('#FILAMENT').val(settings['FILAMENT']),
			$('#FILENAME').val(settings['FILENAME']),
			$('#FIL_DIA').val(settings['FILAMENT_DIAMETER']),
			$('#START_GCODE').val(settings['START_GCODE']),
			$('#END_GCODE').val(settings['END_GCODE']),
			$('#RETRACTION').val(settings['RETRACT_DIST']),
			$('#BEDSIZE_X').val(settings['BED_X']),
			$('#BEDSIZE_Y').val(settings['BED_Y']),
			$('#BED_MARGIN').val(settings['BED_MARGIN']),
			$('#FAN_SPEED').val(settings['FAN_SPEED']),
			$('#F_START').val(settings['F_START']),
			$('#F_END').val(settings['F_END']),
			$('#F_STEP').val(settings['F_STEP']),
			$('#T_START').val(settings['T_START']),
			$('#T_END').val(settings['T_END']),
			$('#T_STEP').val(settings['T_STEP']),
			$('#MM_S').prop('checked', settings['USE_MMS']);
			$('#DWELL_PRIME').val(settings['PRIME_DWELL']),
			$('#PRIME_LENGTH').val(settings['PRIME_LENGTH']),
			$('#PRIME_AMOUNT').val(settings['PRIME_AMOUNT']),
			$('#WIPE_LENGTH').val(settings['WIPE_LENGTH']),
			$('#BLOB_HEIGHT').val(settings['BLOB_HEIGHT']),
			$('#EXTRUSION_AMOUNT').val(settings['EXTRUSION_AMOUNT']),
			$('#MOVE_SPEED').val(settings['SPEED_MOVE']),
			$('#RETRACT_SPEED').val(settings['SPEED_RETRACT']),
			$('#UNRETRACT_SPEED').val(settings['SPEED_UNRETRACT']),
			$('#PRIME_SPEED').val(settings['SPEED_PRIME']);
		}
	}

	// toggle between mm/s and mm/min speeds
	$('#MM_S').change(speedToggle);

	validateInput();
});
